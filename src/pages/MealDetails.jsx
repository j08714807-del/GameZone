import axios from 'axios'
import React, { useEffect, useState } from 'react'
import "./MealDetails.css"
import { Link, useParams } from 'react-router-dom';

export default function MealDetails() {
    const { id } = useParams();
    const [meal, setMeal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const ingredientImgUrl = "https://www.themealdb.com/images/ingredients/";

    async function getMeal() {
        setLoading(true);
        try {
            const res = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
            if (res.data.meals && res.data.meals.length > 0) {
                setMeal(res.data.meals[0]);
                setError(false);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getMeal();
    }, [id]);

    if (loading) return <div>Загрузка...</div>;
    if (error || !meal) return <div>Ошибка при загрузке блюда</div>;

    // Собираем ингредиенты и их меры в один массив
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const name = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (name && name.trim() !== "") {
            ingredients.push({
                name: name.trim(),
                measure: measure ? measure.trim() : "",
                image: `${ingredientImgUrl}${encodeURIComponent(name.trim())}-Small.png`
            });
        }
    }

    return (
       <div className="meal-container">
    {/* Слева */}
    <div className="main-image-block">
        <img className="main-image" src={meal.strMealThumb} alt={meal.strMeal} />
        <p className="tags">Tags: {meal.strTags || 'No Tags'}</p>
    </div>

    {/* Справа */}
    <div className="ingredients-grid">
        {ingredients.map((item, index) => (
            <Link to={`/ingridient/${item.name}`}>
            <div key={index} className="ingredient-card">
                <img className="ingredient-image" src={item.image} alt={item.name} />
                <span className="ingredient-title">
                    {item.measure} {item.name}
                </span>
            </div>
            </Link>
        ))}
    </div>
</div>
    );
}