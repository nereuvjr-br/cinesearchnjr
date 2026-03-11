import { imgUrl, type TMDBProvider, type TMDBProviders } from "@/lib/tmdb";

const ProviderList = ({ providers }: { providers?: TMDBProviders }) => {
  if (!providers) return <p className="text-muted-foreground text-sm">Não disponível no Brasil</p>;

  const all = [
    ...(providers.flatrate || []),
    ...(providers.rent || []),
    ...(providers.buy || []),
  ];

  const unique = all.filter(
    (p, i, arr) => arr.findIndex((x) => x.provider_id === p.provider_id) === i
  );

  if (unique.length === 0)
    return <p className="text-muted-foreground text-sm">Não disponível no Brasil</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {unique.map((p) => (
        <div
          key={p.provider_id}
          className="flex items-center gap-2 glass-card px-3 py-1.5 text-sm"
          title={p.provider_name}
        >
          <img
            src={imgUrl(p.logo_path, "w45")!}
            alt={p.provider_name}
            className="h-6 w-6 rounded"
          />
          <span className="text-foreground">{p.provider_name}</span>
        </div>
      ))}
    </div>
  );
};

export default ProviderList;
