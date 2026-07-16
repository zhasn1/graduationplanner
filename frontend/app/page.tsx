import { HomePage } from "@/components/HomePage";
import { getPrograms } from "@/lib/db";

const Home = () => {
  const programs = getPrograms();
  return <HomePage programs={programs} />
  
}

export default Home