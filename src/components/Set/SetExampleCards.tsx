import SetCard from "./SetCard";
export default function SetExampleCards() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <SetCard
        card={{
          shape: "oval",
          color: "red",
          fill: "striped",
          number: 2,
        }}
        size="lg"
      />
      <SetCard
        card={{
          shape: "squiggle",
          color: "green",
          fill: "striped",
          number: 3,
        }}
        size="lg"
      />
      <SetCard
        card={{
          shape: "oval",
          color: "red",
          fill: "striped",
          number: 1,
        }}
        size="lg"
      />
      <SetCard
        card={{
          shape: "diamond",
          color: "purple",
          fill: "solid",
          number: 3,
        }}
        size="lg"
      />
      <SetCard
        card={{
          shape: "squiggle",
          color: "red",
          fill: "solid",
          number: 1,
        }}
        size="lg"
      />
      <SetCard
        card={{
          shape: "squiggle",
          color: "green",
          fill: "open",
          number: 2,
        }}
        size="lg"
      />
      <SetCard
        card={{
          shape: "diamond",
          color: "purple",
          fill: "striped",
          number: 1,
        }}
        size="lg"
      />
      <SetCard
        card={{
          shape: "diamond",
          color: "green",
          fill: "solid",
          number: 2,
        }}
        size="lg"
      />
      <SetCard
        card={{
          shape: "oval",
          color: "purple",
          fill: "striped",
          number: 1,
        }}
        size="lg"
      />
      <SetCard
        card={{
          shape: "oval",
          color: "purple",
          fill: "open",
          number: 2,
        }}
        size="lg"
      />
      <SetCard
        card={{
          shape: "squiggle",
          color: "red",
          fill: "striped",
          number: 2,
        }}
        size="lg"
      />
      <SetCard
        card={{
          shape: "diamond",
          color: "green",
          fill: "open",
          number: 1,
        }}
        size="lg"
      />
    </div>
  );
}
