import  { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import SearchBar from "../../components/SearchBar/SearchBar"
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'


const Home = () => {
  const [category,setCategory]=useState("All");
  const [search, setSearch] = useState("");
  return (
    <div>
      <Header/>
      <SearchBar search={search} setSearch={setSearch} />
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} search={search} />
      <AppDownload/>
    </div>
  )
}

export default Home
