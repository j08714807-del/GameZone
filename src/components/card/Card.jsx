import React from "react";
import "./Card.css";
import { Link } from "react-router-dom";

function Card({ data }) {
  return (
    <Link to={`/meal/${data.idMeal}`}>
    <div className="card">
      <div className="card-image-container">
        <img src={data.strMealThumb} alt={data.strMeal} className="card-image" />
      </div>
      <h3 className="card-title">{data.strMeal}</h3>
    </div>
    </Link>
  );
}

export default Card;
