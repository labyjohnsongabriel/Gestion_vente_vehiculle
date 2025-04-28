import React from "react";
import "/src/App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SearchIcon from "@mui/icons-material/Search";
export default function recherche() {
  return (
    <div className="searchBox -position-relative d-flex align-items-center">
      <SearchIcon className="icon" />
      <input type="text" placeholder="Rechercher ici ..." />
    </div>
  );
}
