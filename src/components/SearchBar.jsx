import React from "react";

const SearchBar = ({ q = "", onSearchSubmit }) => {
  return (
    <form onSubmit={onSearchSubmit} className="mt-4">
      <div className="relative max-w-lg">
        <input
          name="q"
          defaultValue={q}
          type="search"
          placeholder="Search products..."
          className="w-full h-12 rounded-full pl-4 pr-28 outline-none shadow-md"
          style={{ backgroundColor: "#fff", color: "#333", border: `1px solid #33322222` }}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-full font-semibold transition"
          style={{ background: "#FFD700", color: "#333" }}
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;