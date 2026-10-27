import { ImageResponse } from "next/og";
import { getPlan } from "@/server/db/plans";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function copyFor(id: string) {
  try {
    const plan = await getPlan(id);
    const total = plan.items.length;
    const done = plan.items.filter((item) => item.status === "upgraded").length;
    return { title: plan.name, subtitle: `${total} packages · ${done} marked upgraded` };
  } catch {
    return { title: "Uplift", subtitle: "Plan not found" };
  }
}

export default async function OpenGraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const copy = await copyFor(id);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#16171d",
          color: "#f4f4f5",
        }}
      >
        <div style={{ fontSize: 28, color: "#8b7cf6" }}>Uplift</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 64, fontWeight: 600 }}>{copy.title}</div>
          <div style={{ fontSize: 28, color: "#a1a1aa" }}>{copy.subtitle}</div>
        </div>
      </div>
    ),
    size,
  );
}
