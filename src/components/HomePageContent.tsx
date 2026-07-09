import Hero from "./Hero";
import Summary from "./Summary";
import AppShowcase from "./AppShowcase";
import ProOverview from "./ProOverview";
import FeaturedGuides from "./FeaturedGuides";
import ShortFAQ from "./ShortFAQ";
import FinalDownload from "./FinalDownload";

export default function HomePageContent() {
  return (
    <>
      <Hero />
      <Summary />
      <AppShowcase />
      <ProOverview />
      <FeaturedGuides />
      <ShortFAQ />
      <FinalDownload />
    </>
  );
}
