"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Loader2 } from "lucide-react";

export default function MisEventosRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(Array.isArray(params?.id) ? params.id[0] : params?.id);

  useEffect(() => {
    if (!id) {
      router.replace("/mis-eventos");
      return;
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("creator-event-view", String(id));
    }
    router.replace(`/eventos/${id}`);
  }, [id]);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header onAuthClick={() => {}} />
      <div className="flex-1 w-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="h-[40vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-green-800 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Abriendo el detalle de tu evento...</p>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </main>
  );
}
