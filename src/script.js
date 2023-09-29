import { createPlayground } from "https://unpkg.com/livecodes@0.2.0/livecodes.js";

let playground;

const getContent = async (url) => {
  const pathname = new URL(url).pathname.slice(1);
  const [user, repo, _type, branch, ...path] = pathname.split("/");
  const [name, _extension] = path[path.length - 1].split(".");
  const scriptUrl = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path.join(
    "/",
  )}`;
  const script = await fetch(scriptUrl).then(async (res) =>
    addTestRunner(await res.text()),
  );
  return { script, name };
};

const addTestRunner = (code) => {
  const sep = 'if __name__ == "__main__":\n';
  const [algCode, run] = code.split(sep);
  const comment =
    run
      ?.split("\n")
      .map((line) => `# ${line}`)
      .join("\n") || "";
  const testRunner = `\n    import doctest\n    doctest.testmod(verbose=True)`;
  return `${algCode}${sep}${comment}${testRunner}`;
};

const loadAlgorithm = async () => {
  const algorithm = window.algorithmSelect.value;
  const algorithmUrl = `${window.lang.repo}/blob/master/${algorithm}.${window.lang.ext}`;
  if (playground) {
    history.pushState(
      {},
      "",
      `${location.origin}${location.pathname}?algorithm=${algorithm}`,
    );
  }
  const { script, name } = await getContent(algorithmUrl);

  const config = {
    title: name,
    languages: [window.lang.name],
    script: {
      language: window.lang.name,
      content: script,
    },
    tools: {
      enabled: ["console"],
      active: "console",
      status: "full",
    },
  };

  if (!playground) {
    playground = await createPlayground("#container", {
      appUrl: "https://dev.livecodes.io/",
      config,
    });
  } else {
    playground.setConfig(config);
  }
};

window.algorithmSelect.addEventListener("change", loadAlgorithm);
loadAlgorithm();
