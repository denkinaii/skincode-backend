export const getLumiResponse = async (userMessage) => {
  try {
    const response = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage })
    });

    const data = await response.json();
    return data.reply;
  } catch (e) {
    return "LUMI зараз поза зоною досяжності 🌸";
  }
};