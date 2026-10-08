import { useEffect, useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'

const Home = () => {
  const [category,setCategory]=useState("All");

  useEffect(() => {
    const sectionId = window.location.hash.slice(1);
    if (!sectionId) return;
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "instant", block: "start" });
  }, []);

  return (
    <div>
      <Header/>
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category}/>
      <AppDownload/>
    </div>
  )
}

export default Home
