import Provience_mast from "@/components/provience_mast";
import City_mast from "@/components/city_mast";
import Country_mast from "@/components/country_mast";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Link href={"/country"} style={{ border: "1px", margin: 10 }}>
        Country Form
      </Link>
      <Link href={"/province"}>Province Form</Link>
    </>
  );
}
