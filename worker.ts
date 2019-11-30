import chokidar from "chokidar";
import { throttle } from "lodash";
import ms from "ms";
import Shell from "shelljs";

const gitRemoteUrl = "git://github.com/LALA-UACh/TrAC-v2";

const production = process.env.NODE_ENV === "production";
console.log(
  `Worker started in ${production ? "production" : "development"} mode!`
);

const installDependencies = throttle(
  (changed: string) => {
    if (changed.includes("package.json")) {
      Shell.exec("yarn --frozen-lockfile --production=false");
      return true;
    }
    return false;
  },
  ms("1 minute"),
  {
    leading: true,
    trailing: false,
  }
);

const APIWorker = async () => {
  if (production) {
    const APIWatcher = chokidar.watch(["package.json", "api"], {
      ignored: "api/dist",
      ignoreInitial: true,
    });

    const onChange = throttle(
      () => {
        const build = Shell.exec("yarn build-api", { silent: false });
        if (build.code === 0) {
          const APIReload = Shell.exec(
            `pm2 reload ecosystem.yaml --only api-prod`,
            { silent: true }
          );

          if (APIReload.code === 0) {
            console.log("API Reloaded!");
          }
        }
      },
      ms("10 seconds"),
      {
        leading: false,
        trailing: true,
      }
    );

    APIWatcher.on("change", async changed => {
      console.log("APIWatcher", { changed });
      const installedDependencies = installDependencies(changed);
      if (!installedDependencies) {
        onChange();
      }
    });
  } else {
    Shell.exec(`yarn build-api -w --sourceMap`, { async: true });
  }
};

const ClientWorker = async () => {
  const reloadNext = () => {
    return Shell.exec(
      `pm2 reload ecosystem.yaml --only ${
        production ? "next-prod" : "next-dev"
      }`,
      { silent: true }
    );
  };

  if (production) {
    const ClientWatcher = chokidar.watch(
      [
        "package.json",
        "src",
        "constants",
        "public",
        "typings",
        "tsconfig.json",
      ],
      {
        ignoreInitial: true,
      }
    );

    const onChange = throttle(
      () => {
        const yarnBuild = Shell.exec("yarn build-client", {
          silent: false,
        });

        if (yarnBuild.code === 0) {
          if (reloadNext().code === 0) {
            console.log("Client Reloaded!");
          }
        }
      },
      ms("10 seconds"),
      {
        leading: false,
        trailing: true,
      }
    );

    ClientWatcher.on("change", async changed => {
      console.log("ClientWatcher", { changed });
      const installedDependencies = installDependencies(changed);
      if (!installedDependencies) {
        onChange();
      }
    });
  }
};

APIWorker();
ClientWorker();

if (process.env.NODE_ENV === "production") {
  let gitRemote = Shell.exec(`git ls-remote ${gitRemoteUrl}`, {
    silent: true,
  }).stdout;

  setInterval(async () => {
    const gitRemoteStatus = Shell.exec(`git ls-remote ${gitRemoteUrl}`, {
      silent: true,
    }).stdout;
    if (gitRemoteStatus !== gitRemote) {
      // If there is a change in the remote repository, fetch it and reset the local repository to it's head
      gitRemote = gitRemoteStatus;
      Shell.exec("git fetch && git reset --hard origin/master", {
        async: true,
      });
    }
  }, ms("30 seconds"));
}