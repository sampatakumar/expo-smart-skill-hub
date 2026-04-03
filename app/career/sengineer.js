import { WebView } from "react-native-webview";

export default function PlannerScreen() {
  return (
    <WebView
      source={{ uri: "https://youtube.com" }}
      style={{ flex: 1 }}
    />
  );
}