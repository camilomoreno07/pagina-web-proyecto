"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface ReviewExperienceData {
  id_sesion: string;
  id_estudiante: string;
  nombre_curso: string;
  fecha_simulacion: string; // "YYYY-MM-DD"
  hora_inicio: string; // "HH:mm:ss"
  tiempo_total: number; // segundos
  decisiones_medicas: string[];
  url_videos: Record<string, string>;
  momentos: number[];
}

interface ReviewExperienceProps {
  idEstudiante: string;
  nombreCurso: string;
}

const getMostRecentSimulation = (
  simulations: ReviewExperienceData[],
  cursoNombre: string
): ReviewExperienceData | null => {
  if (!simulations || simulations.length === 0) return null;

  // Filtrar por nombre del curso
  const filtered = simulations.filter(sim => sim.nombre_curso === cursoNombre);
  if (filtered.length === 0) return null;

  // Obtener el más reciente
  return filtered.reduce((latest, current) => {
    const latestDateTime = new Date(`${latest.fecha_simulacion}T${latest.hora_inicio}`);
    const currentDateTime = new Date(`${current.fecha_simulacion}T${current.hora_inicio}`);
    return currentDateTime > latestDateTime ? current : latest;
  });
};

export default function ReviewExperience({
  idEstudiante,
  nombreCurso
}: ReviewExperienceProps) {
  const [data, setData] = useState<ReviewExperienceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://sima.uis.edu.co/simulacion/api/simulacion/estudiante/${idEstudiante}`
        );
        if (res.ok) {
          const json: ReviewExperienceData[] = await res.json();

          console.log(json)

          // Filtrar por curso y obtener el más reciente
          const mostRecent = getMostRecentSimulation(json, nombreCurso);

          setData(mostRecent);
          console.log(nombreCurso);
          console.log("Lista completa:", json);
          console.log("Simulación más reciente del curso:", mostRecent);
        } else {
          setData(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idEstudiante, nombreCurso]);

  if (loading) {
    return <p className="text-gray-500">Cargando datos...</p>;
  }

  if (!data || !data.id_estudiante) {
    return (
      <div className="w-full min-h-[120px] border border-dashed border-gray-300 rounded flex items-center justify-center px-4 py-6 text-center text-gray-500 text-sm italic">
        Esta sección mostrará los resultados una vez hayas asistido a la Actividad Experiencial Presencial
      </div>
    );
  }

  const videoTitles = Object.keys(data.url_videos);
  const videoUrls = Object.values(data.url_videos);
  const tiempoTotalMin = (data.tiempo_total / 60).toFixed(2);

  const nextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videoUrls.length);
  };

  const prevVideo = () => {
    setCurrentVideoIndex(
      (prev) => (prev - 1 + videoUrls.length) % videoUrls.length
    );
  };

  // Preparar datos para el gráfico
  const chartData = data.momentos.map((tiempo, index) => ({
    seccionNum: index + 1,
    tiempo,
  }));

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { seccionNum, tiempo } = payload[0].payload;
      return (
        <div className="bg-white border border-gray-300 p-2 rounded shadow text-sm">
          <p>Sección: {seccionNum}</p>
          <p>Tiempo: {tiempo} s</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="bg-white shadow p-6 rounded-lg hover:shadow-lg transition">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Resultados de la Actividad Experiencial Presencial
        </h2>

        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-gray-500">
            Fecha de aplicación:
          </h3>
          <span className="text-sm px-2 py-1 rounded text-gray-500 bg-gray-100">
            {data.fecha_simulacion}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-gray-500">Hora de inicio:</h3>
          <span className="text-sm px-2 py-1 rounded text-gray-500 bg-gray-100">
            {data.hora_inicio}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-500">
            Tiempo de completado:
          </h3>
          <span className="text-sm px-2 py-1 rounded text-green-700 bg-green-100">
            {tiempoTotalMin} minutos
          </span>
        </div>
      </div>

      {/* Carrusel de videos */}
      <div className="bg-white shadow p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 pb-2 text-left">
          Videos Capturados Durante la Simulación
        </h3>
        <div className="flex flex-row items-stretch rounded-lg overflow-hidden shadow-lg">
          {/* Botón anterior */}
          <button
            onClick={prevVideo}
            className="bg-primary-40 hover:bg-primary-60 text-white w-10 sm:w-12 flex items-center justify-center transition rounded-l-lg"
          >
            ◀
          </button>

          {/* Contenedor del video */}
          <div className="flex flex-col items-center flex-1 bg-primary-40 px-2 sm:px-4 pt-4 pb-6">
            <p className="font-semibold mt-1 mb-3 text-center">
              <span className="inline-block text-sm sm:text-base px-3 py-1 rounded bg-primary-30 text-white">
                {videoTitles[currentVideoIndex]}
              </span>
            </p>
            <iframe
              className="w-full h-48 sm:h-64 rounded-lg border-4 border-primary-60 shadow-lg"
              src={videoUrls[currentVideoIndex].replace("watch?v=", "embed/")}
              allowFullScreen
            ></iframe>
            <p className="font-semibold mt-5 text-center">
              <span className="text-sm sm:text-base px-3 py-1 rounded bg-primary-30 text-white">
                {currentVideoIndex + 1} / {videoUrls.length}
              </span>
            </p>
          </div>

          {/* Botón siguiente */}
          <button
            onClick={nextVideo}
            className="bg-primary-40 hover:bg-primary-60 text-white w-10 sm:w-12 flex items-center justify-center transition rounded-r-lg"
          >
            ▶
          </button>
        </div>
      </div>


      {/* Tabla decisiones médicas */}
      <div className="bg-white shadow p-6 rounded-lg overflow-x-auto">
        <div className="rounded-lg overflow-hidden border border-gray-300 min-w-[300px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary-40">
                <th className="px-4 py-2 text-center text-primary-100 text-sm sm:text-base">
                  Decisiones Médicas Tomadas por el Estudiante
                </th>
              </tr>
            </thead>
            <tbody>
              {data.decisiones_medicas.map((decision, index) => (
                <tr key={index}>
                  <td className="border-t border-gray-300 px-4 py-2 text-left text-sm sm:text-base">
                    {decision}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diagrama de barras de momentos */}
      <div className="bg-white shadow p-6 rounded-lg">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center">
          Tiempo empleado en cada sección de la experiencia
        </h3>
        <ResponsiveContainer
          width="100%"
          height={typeof window !== "undefined" && window.innerWidth < 640 ? 220 : 300}
        >
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="seccionNum"
              label={{ value: "Sección", position: "bottom" }}
            />
            <YAxis
              label={{
                value: "Tiempo [s]",
                angle: -90,
                position: "left",
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="tiempo"
              fill="#509BA8"
              stroke="#32818E"
              strokeWidth={1}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
