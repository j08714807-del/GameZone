import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductList from "../components/productList/ProductList";
import "./Alphabet.css"; // CSS файлды импорттоо

export default function Alphabet() {
  const { letter } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function getFood() {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`
      );
      setData(res.data.meals);
      setLoading(false);
      setError(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setError(true);
    }
  }

  useEffect(() => {
    getFood();
  }, [letter]);

  if (loading) return <div className="alphabet-page">Загрузка...</div>;
  if (error) return <div className="alphabet-page">Ошибка</div>;
  if (data == null) return <div className="alphabet-page">Тамак жок</div>;

  return (
    <div className="alphabet-page">
      <h1 className="alphabet-title">Meals starting with '{letter}'</h1>
      <ProductList food={data} />
    </div>
  );
}