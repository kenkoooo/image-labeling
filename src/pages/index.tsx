import { useState } from "react";
import { Button, Col, Container, Input, Row, Text } from "@nextui-org/react";
import { useRouter } from "next/router";
import { open } from "@tauri-apps/api/dialog";

function App() {
  const [input, setInput] = useState("");
  const { labels, toggleLabel } = useLabelList();
  const router = useRouter();
  const [directory, setDirectory] = useState<string>();

  return (
    <Container fluid>
      {labels.map((label) => (
        <Row key={label}>
          <Text h3>{label}</Text>
        </Row>
      ))}
      <Row justify="center">
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              toggleLabel(input);
              setInput("");
            }
          }}
        />
        <Button
          disabled={!/^[0-9a-zA-Z_.-]+$/.test(input)}
          onClick={() => {
            toggleLabel(input);
            setInput("");
          }}
        >
          Add
        </Button>
      </Row>
      <Row>
        <Col>
          <Button
            onClick={async () => {
              const selected = await open({
                multiple: false,
                directory: true,
              });
              if (!Array.isArray(selected)) {
                setDirectory(selected);
              }
            }}
          >
            Open Directory
          </Button>
        </Col>
        <Col>{directory}</Col>
      </Row>
      <Row justify="center">
        <Button
          disabled={!labels.length || !directory}
          onClick={() => {
            router.push({
              pathname: "/view",
              query: {
                labels: JSON.stringify(labels),
                directory,
              },
            });
          }}
        >
          Start
        </Button>
      </Row>
    </Container>
  );
}

export default App;

const useLabelList = () => {
  const [labels, setLabels] = useState<string[]>([]);
  const toggleLabel = (label: string) => {
    if (labels.includes(label)) {
      setLabels(labels.filter((l) => l !== label));
    } else {
      setLabels([...labels, label]);
    }
  };
  return { labels, toggleLabel };
};
