import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  const response = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
    //dedupingInterval: 2000, //(default)
  });
  return (
    <>
      <h1>Status</h1>

      <UpdatedAt />
      <DatabaseInfo />

      <pre>{JSON.stringify(response.data, null, 2)}</pre>
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando ...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-br");
  }

  return <div>Última atualização: {updatedAtText}</div>;
}

function DatabaseInfo() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let version = "??";
  let openConnections = "??";
  let maxConnections = "??";

  if (!isLoading && data) {
    ({
      version,
      open_connections: openConnections,
      max_connections: maxConnections,
    } = data.dependencies.database);
  }

  return (
    <div>
      <h2>Banco de dados</h2>
      <ul>
        <li>Versão: {version} </li>
        <li>Conexões abertas: {openConnections}</li>
        <li>Conexões máximas: {maxConnections}</li>
      </ul>
    </div>
  );
}
