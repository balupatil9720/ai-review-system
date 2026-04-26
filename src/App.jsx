import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer,
  LineChart, Line
} from "recharts";

const COLORS = {
  Positive: "#22c55e",
  Neutral: "#facc15",
  Negative: "#ef4444"
};

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("https://opensheet.elk.sh/1C_CjCe_j7Aw4J-TkM0n6bz1rP6c4M3UTBzIRLVmK2NM/Sheet1")
      .then(res => setData(res.data))
      .catch(err => console.log(err));
  }, []);

  // Normalize
  const normalizedData = data.map(d => ({
    ...d,
    Sentiment: d.Sentiment?.trim(),
    Rating: Number(d.Rating),
    Date: d.Timestamp ? d.Timestamp.split(" ")[0] : "Unknown"
  }));

  // ================= KPI =================
  const totalReviews = normalizedData.length;
  const positive = normalizedData.filter(d => d.Sentiment === "Positive").length;
  const neutral = normalizedData.filter(d => d.Sentiment === "Neutral").length;
  const negative = normalizedData.filter(d => d.Sentiment === "Negative").length;

  const avgRating =
    totalReviews > 0
      ? (normalizedData.reduce((sum, d) => sum + d.Rating, 0) / totalReviews).toFixed(2)
      : 0;

  // ================= PIE =================
  const sentimentData = [
    { name: "Positive", value: positive },
    { name: "Neutral", value: neutral },
    { name: "Negative", value: negative }
  ];

  // ================= BAR =================
  const productMap = {};
  normalizedData.forEach(d => {
    const product = d.Product;
    if (!productMap[product]) {
      productMap[product] = { total: 0, count: 0 };
    }
    productMap[product].total += d.Rating;
    productMap[product].count += 1;
  });

  const productData = Object.keys(productMap).map(p => ({
    Product: p,
    Rating: Number((productMap[p].total / productMap[p].count).toFixed(2))
  }));

  // ================= LINE (TREND) =================
  const trendMap = {};

  normalizedData.forEach(d => {
    const date = d.Date;

    if (!trendMap[date]) {
      trendMap[date] = { date, Positive: 0, Neutral: 0, Negative: 0 };
    }

    trendMap[date][d.Sentiment] += 1;
  });

  const trendData = Object.values(trendMap);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">

      {/* Header */}
      <h1 className="text-3xl font-bold text-center mb-8">
        📊 Customer Review Dashboard
      </h1>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 p-4 rounded-xl text-center">
          <p className="text-gray-400 text-sm">Total Reviews</p>
          <h2 className="text-2xl font-bold">{totalReviews}</h2>
        </div>

        <div className="bg-green-600 p-4 rounded-xl text-center">
          <p className="text-sm">Positive</p>
          <h2 className="text-2xl font-bold">{positive}</h2>
        </div>

        <div className="bg-yellow-500 p-4 rounded-xl text-center">
          <p className="text-sm">Neutral</p>
          <h2 className="text-2xl font-bold">{neutral}</h2>
        </div>

        <div className="bg-red-500 p-4 rounded-xl text-center">
          <p className="text-sm">Negative</p>
          <h2 className="text-2xl font-bold">{negative}</h2>
        </div>
      </div>

      {/* Avg Rating */}
      <div className="bg-slate-800 p-4 rounded-xl mb-8 text-center">
        <p className="text-gray-400">Average Rating</p>
        <h2 className="text-3xl font-bold">{avgRating}</h2>
      </div>

     
      {/* ================= EXISTING CHARTS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Pie */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">
            Sentiment Distribution
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={sentimentData} dataKey="value" outerRadius={100}>
                {sentimentData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">
            Product Ratings (Average)
          </h2>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={productData}>
              <XAxis
                dataKey="Product"
                angle={-30}
                textAnchor="end"
                interval={0}
                height={80}
                tickFormatter={(value) =>
                  value.length > 12 ? value.slice(0, 12) + "..." : value
                }
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Rating" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Footer */}
      <p className="text-center text-gray-400 mt-10 text-sm">
        AI-powered insights • Real-time analytics
      </p>

    </div>
  );
}

export default App;