const { exec } = require("node:child_process");

let count = 0;
//const clock = ["🌑", "🌘", "🌗", "🌖", "🌕", "🌔", "🌓", "🌒"];
const clock = ["📨   📪", " 📨  📪", "  📨 📪", "   📨📭", "     📬"];

function checkPostgres(timeout = 50) {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(
        `\r${clock[count % clock.length]} Waiting for PostgreSQL accept connections...`,
      );
      count++;

      setTimeout(checkPostgres, timeout);
      return;
    }
    console.log("\n     📫 PostgreSQL is ready and accepting connections!\n");
  }
}
checkPostgres();
