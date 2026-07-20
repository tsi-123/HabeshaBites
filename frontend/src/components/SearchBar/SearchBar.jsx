import PropTypes from "prop-types";
import "./SearchBar.css";
import { FiSearch } from "react-icons/fi";

const SearchBar = ({ search, setSearch }) => {
  return (
    <div className="search-bar">
      <FiSearch className="search-icon" />
      <input
        type="text"
        placeholder="Search Ethiopian dishes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};

SearchBar.propTypes = {
  search: PropTypes.string.isRequired,
  setSearch: PropTypes.func.isRequired,
};

export default SearchBar