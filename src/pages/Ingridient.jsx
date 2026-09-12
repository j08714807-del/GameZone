import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductList from "../components/productList/ProductList";

export default function Ingridient() {
    const { text } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const ingredientImgUrl = "https://www.themealdb.com/images/ingredients/";

  async function getFood() {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/filter.php?i=${text}`,
      );
      console.log(res.data);
      setData(res.data.meals);
      setLoading(false);
      setError(false);
      return;
    } catch (error) {
      console.error(error);
      setLoading(false);
      setError(true);
    }
  }

  useEffect(() => {
    getFood();
  }, [text]);

  if (loading) {
    return <div>загрузка...</div>;
  }
  if (error) {
    return <div>ошибка</div>;
  }
  if (data == null){
    return <div>Тамак жок</div>
  }
  return (
    <div className="alphabet-page">
        <img src={ `${ingredientImgUrl}${encodeURIComponent(text.trim())}-Small.png`} alt="" />
      <ProductList food={data}/>
    </div>
  )
}
