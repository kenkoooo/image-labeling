import { Button, Container, Loading, Row, Text } from "@nextui-org/react";
import { createDir, readDir, renameFile } from "@tauri-apps/api/fs";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";

const View = () => {
  const { labels, directory } = useParameters();
  const imagePaths = useImagePaths(directory);
  const [pos, setPos] = useState(0);

  if (!imagePaths.data) {
    return <Loading />;
  }

  const images = imagePaths.data;
  if (images.length <= pos) {
    return (
      <Container fluid>
        <Row>
          <Text h3>All done!</Text>
        </Row>
        <Row>
          <Link href="/">Back</Link>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row>
        {labels.map((label) => (
          <Button
            key={label}
            onClick={async () => {
              const image = images[pos];
              await moveFile(image.dir, image.name, label);
              setPos(pos + 1);
            }}
          >
            {label}
          </Button>
        ))}
      </Row>
      <Row justify="center">
        <img
          src={images[pos].path}
          style={{ objectFit: "scale-down" }}
          height="500px"
        />
      </Row>
    </Container>
  );
};
export default View;

const useParameters = () => {
  const router = useRouter();
  const labels = (() => {
    const labels = router.query["labels"];
    if (Array.isArray(labels)) {
      return labels;
    } else {
      return JSON.parse(labels) as string[];
    }
  })();
  const directory = (() => {
    const directory = router.query["directory"];
    if (Array.isArray(directory)) {
      return directory[0];
    } else {
      return directory;
    }
  })();
  return { labels, directory };
};

const directoryEntriesFetcher = async (directory: string) => {
  const entries = await readDir(directory);
  const files = [] as { path: string; dir: string; name: string }[];
  entries.forEach((e) => {
    const { name, path } = e;
    if (name.endsWith(".png") || name.endsWith(".jpg")) {
      const dir = path.slice(0, path.length - name.length);
      files.push({
        path: convertFileSrc(path),
        name,
        dir,
      });
    }
  });
  return files;
};
const useImagePaths = (directory: string) => {
  const imagePaths = useSWR(directory, directoryEntriesFetcher);
  return imagePaths;
};

const moveFile = async (directory: string, name: string, label: string) => {
  await createDir(`${directory}/${label}`, { recursive: true });
  await renameFile(`${directory}/${name}`, `${directory}/${label}/${name}`);
};
