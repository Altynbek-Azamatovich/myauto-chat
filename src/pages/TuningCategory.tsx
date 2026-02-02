import { useParams, useNavigate } from "react-router-dom";
import { UnderDevelopment } from "@/components/UnderDevelopment";

const categoryTitles: Record<string, string> = {
  "body-kit": "Обвес",
  "engine": "Тюнинг двигателя",
  "wheels": "Диски",
  "painting": "Покраска",
  "interior": "Интерьер",
  "suspension": "Подвеска",
  "lighting": "Оптика",
  "audio": "Аудиосистема",
};

const TuningCategory = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const title = categoryId ? categoryTitles[categoryId] || "Тюнинг" : "Тюнинг";

  return (
    <UnderDevelopment
      title={title}
      subtitle="Раздел находится в разработке"
      onBack={() => navigate("/", { state: { tuningMode: true } })}
    />
  );
};

export default TuningCategory;
