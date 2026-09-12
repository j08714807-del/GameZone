import React from 'react'
import Card from '../card/Card'

export default function ProductList({food}) {
  return (
    <div style={{display:"flex", gap:"20px",
        flexWrap:"wrap",
        justifyContent:"center"
    }}>
      {
        food?.map((el)=>(
            <Card data={el} key={el.idMeal}/>
        ))
      }
    </div>
  )
}
