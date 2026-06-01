import { Metadata } from "next";
import { CityAnalyticsPage } from "@/components/city-analytics-page";

export const metadata: Metadata = {
  title: "City Analytics",
  description:
    "Full civic analytics for your city — ward performance, categories, zones, assembly constituencies, and representative accountability.",
};

export default function AnalyticsRoutePage() {
  return <CityAnalyticsPage />;
}
