import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend
} from "recharts";

const COLORS = {
  Positive: "#00C49F",
  Neutral: "#FFBB28",
  Negative: "#FF4C4C"
};

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("https://opensheet.elk.sh/1C_CjCe_j7Aw4J-TkM0n6bz1rP6c4M3UTBzIRLVmK2NM/Sheet1")
      .then(res => setData(res.data))
      .catch(err => console.log(err));
  }, []);

  // 🔥 Normalize sentiment (fix hidden bugs)
  const normalizedData = data.map(d => ({
    ...d,
    Sentiment: d.Sentiment?.trim()
  }));

  // 📊 Sentiment distribution
  const sentimentData = [
    {
      name: "Positive",
      value: normalizedData.filter(d => d.Sentiment === "Positive").length
    },
    {
      name: "Neutral",
      value: normalizedData.filter(d => d.Sentiment === "Neutral").length
    },
    {
      name: "Negative",
      value: normalizedData.filter(d => d.Sentiment === "Negative").length
    }
  ];

  // 📈 Product average ratings (GROUPED)
  const productMap = {};

  normalizedData.forEach(d => {
    const product = d.Product;
    const rating = Number(d.Rating);

    if (!productMap[product]) {
      productMap[product] = { total: 0, count: 0 };
    }

    productMap[product].total += rating;
    productMap[product].count += 1;
  });

  const productData = Object.keys(productMap).map(p => ({
    Product: p,
    Rating: (productMap[p].total / productMap[p].count).toFixed(2)
  }));

  return (
    <div style={{ padding: "20px", color: "white", background: "#0f172a", minHeight: "100vh" }}>
      <h2>📊 Customer Review Dashboard</h2>

      <div style={{ display: "flex", gap: "60px", marginTop: "40px" }}>

        {/* 🔵 Pie Chart */}
        <div>
          <h3>Sentiment Distribution</h3>
          <PieChart width={300} height={300}>
            <Pie data={sentimentData} dataKey="value" outerRadius={100}>
              {sentimentData.map((entry, index) => (
                <Cell key={index} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </div>

        {/* 🟣 Bar Chart */}
        <div>
          <h3>Product Ratings</h3>
          <BarChart width={800} height={300} data={productData}>
            <XAxis dataKey="Product" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Rating" fill="#8884d8" />
          </BarChart>
        </div>

      </div>
    </div>
  );
}

export default App;