#!/usr/bin/env node
/**
 * Lightweight helper to add a column to a Supabase (Postgres) table.
 *
 * Usage examples:
 *   node scripts/addColumn.cjs products store text --default "Mena Bazar" --not-null
 *   node scripts/addColumn.cjs --table products --column store --type text
 *   node scripts/addColumn.cjs products whatsapp_clicks integer --default-literal 0
 *
 * Required environment variable:
 *   SUPABASE_DB_URL (postgres connection string, e.g. postgresql://postgres:...@db.xxx.supabase.co:5432/postgres)
 * Optional fallbacks:
 *   SUPABASE_DB_CONNECTION_STRING, SUPABASE_DB_URI, POSTGRES_URL, DATABASE_URL
 *
 * You can place the secret connection string in .env (never commit it!) or export it
 * before running the script. The script is idempotent: if the column already exists
 * it will exit without making changes.
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const dotenv = require("dotenv");

/** Load environment variables from .env and .env.local if present */
const envFiles = [".env", ".env.local"];
for (const file of envFiles) {
  const resolved = path.resolve(process.cwd(), file);
  if (fs.existsSync(resolved)) {
    dotenv.config({ path: resolved, override: true });
  }
}

const connectionString =
  process.env.SUPABASE_DB_URL ||
  process.env.SUPABASE_DB_CONNECTION_STRING ||
  process.env.SUPABASE_DB_URI ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "Missing SUPABASE_DB_URL (or equivalent) environment variable. Set the Postgres connection string from Supabase project settings."
  );
  process.exit(1);
}

const { options, positionals } = parseArgs(process.argv.slice(2));

const schema = options.schema || "public";
const table = options.table || positionals[0];
const column = options.column || positionals[1];
const rawType = options.type || positionals[2];
const comment = options.comment;
const defaultValue = options.default;
const defaultLiteral = options["default-literal"];
let dryRun = false;
try {
  dryRun = getBooleanOption(options, "dry-run", false);
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}

if (!table || !column || !rawType) {
  printUsage();
  process.exit(1);
}

assertIdentifier("schema", schema);
assertIdentifier("table", table);
assertIdentifier("column", column);

if (defaultValue !== undefined && defaultLiteral !== undefined) {
  console.error(
    "Provide either --default (string literal) or --default-literal (raw SQL literal), not both."
  );
  process.exit(1);
}

const columnType = String(rawType).trim();
assertSqlFragment("type", columnType);

let defaultClause = "";
if (defaultLiteral !== undefined) {
  const literal = String(defaultLiteral).trim();
  assertSqlFragment("default-literal", literal);
  defaultClause = ` DEFAULT ${literal}`;
} else if (defaultValue !== undefined) {
  const escaped = String(defaultValue).replace(/'/g, "''");
  defaultClause = ` DEFAULT '${escaped}'`;
}

let nullable;
try {
  nullable = resolveNullable(options);
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
if (!nullable && !defaultClause) {
  console.warn(
    "Warning: Adding a NOT NULL column without a default may fail if the table already has rows."
  );
}

const quotedSchema = quoteIdent(schema);
const quotedTable = quoteIdent(table);
const quotedColumn = quoteIdent(column);

const alterSql = `ALTER TABLE IF EXISTS ${quotedSchema}.${quotedTable} ADD COLUMN IF NOT EXISTS ${quotedColumn} ${columnType}${defaultClause}${
  nullable ? "" : " NOT NULL"
};`;
const commentSql =
  comment !== undefined
    ? {
        text: `COMMENT ON COLUMN ${quotedSchema}.${quotedTable}.${quotedColumn} IS $1;`,
        values: [comment],
      }
    : null;

(async () => {
  const client = new Client({
    connectionString,
    ssl:
      process.env.SUPABASE_DB_SSL === "disable"
        ? false
        : { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const exists = await client.query(
      `SELECT 1
         FROM information_schema.columns
        WHERE table_schema = $1
          AND table_name = $2
          AND column_name = $3
        LIMIT 1;`,
      [schema, table, column]
    );

    if (exists.rowCount > 0) {
      console.log(
        `Column ${schema}.${table}.${column} already exists. No changes applied.`
      );
      process.exit(0);
    }

    console.log("Executing:");
    console.log("  " + alterSql);
    if (dryRun) {
      console.log("Dry run enabled; skipping execution.");
      process.exit(0);
    }

    await client.query(alterSql);

    if (commentSql) {
      await client.query(commentSql);
    }

    console.log(
      `Column ${schema}.${table}.${column} added successfully to Supabase.`
    );
  } catch (error) {
    console.error("Failed to add column:", error.message || error);
    process.exit(1);
  } finally {
    try {
      await client.end();
    } catch (err) {
      if (err) {
        console.warn("Failed to close database connection cleanly:", err);
      }
    }
  }
})();

function parseArgs(argv) {
  const opts = {};
  const positionals = [];

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      opts[key] = true;
    } else {
      opts[key] = next;
      i += 1;
    }
  }

  return { options: opts, positionals };
}

function printUsage() {
  console.log(
    `\nAdd a column to Supabase Postgres.\n\nUsage:\n  node scripts/addColumn.cjs <table> <column> <type> [options]\n\nOptions:\n  --schema <name>             Schema name (default: public)\n  --default <string>          Default value treated as string literal\n  --default-literal <sql>     Default value as raw SQL literal\n  --nullable <true|false>     Whether the column allows NULL (default: true)\n  --not-null                  Shorthand to mark column as NOT NULL\n  --comment <text>            Add a comment/description to the column\n  --dry-run                   Show SQL without executing it\n\nExamples:\n  node scripts/addColumn.cjs products store text\n  node scripts/addColumn.cjs products store text --default "Mena Bazar"\n  node scripts/addColumn.cjs products whatsapp_clicks integer --default-literal 0\n`
  );
}

function assertIdentifier(label, value) {
  const IDENT = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  if (!IDENT.test(value)) {
    console.error(`Invalid ${label} identifier: ${value}`);
    process.exit(1);
  }
}

function assertSqlFragment(label, value) {
  const fragment = String(value).trim();
  if (!fragment) {
    console.error(`Invalid ${label}: value cannot be empty.`);
    process.exit(1);
  }
  if (/[;]/.test(fragment)) {
    console.error(`Invalid ${label}: semicolons are not allowed.`);
    process.exit(1);
  }
}

function quoteIdent(identifier) {
  return '"' + identifier.replace(/"/g, '""') + '"';
}

function getBooleanOption(opts, key, defaultValue) {
  if (!Object.prototype.hasOwnProperty.call(opts, key)) {
    return defaultValue;
  }
  const value = opts[key];
  if (typeof value === "boolean") {
    return value;
  }
  try {
    return toBoolean(value);
  } catch (error) {
    throw new Error(`Cannot interpret boolean flag --${key}: ${value}`);
  }
}

function resolveNullable(opts) {
  if (Object.prototype.hasOwnProperty.call(opts, "not-null")) {
    const v = opts["not-null"];
    if (typeof v === "boolean") return !v ? true : false;
    return !toBoolean(v);
  }
  if (Object.prototype.hasOwnProperty.call(opts, "nullable")) {
    return toBoolean(opts.nullable);
  }
  return true;
}

function toBoolean(value) {
  if (typeof value === "boolean") return value;
  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "n", "off"].includes(normalized)) return false;
  throw new Error(`Cannot interpret boolean value from: ${value}`);
}
