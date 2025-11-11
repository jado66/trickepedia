import Link from "next/link";

export function TrickipediaLogo({ hasUser = false }) {
  return (
    <Link href={hasUser ? "/dashboard" : "/"}>
      <div className="flex flex-col items-center">
        <div className="flex flex-row items-center">
          <div className="flex-shrink-0 flex items-center justify-center mr-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border">
              <span className="text-foreground font-serif text-2xl">T</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl text-foreground uppercase font-serif">
              <span>
                <span style={{ fontSize: "1.3em", verticalAlign: "middle" }}>
                  T
                </span>
                <span
                  style={{
                    verticalAlign: "middle",
                    position: "relative",
                    top: "2px",
                  }}
                >
                  rickipedi
                </span>
                <span style={{ fontSize: "1.3em", verticalAlign: "middle" }}>
                  A
                </span>
              </span>
            </span>
            <span
              className="text-base text-muted-foreground font-serif italic"
              style={{ marginTop: "-4px" }}
            >
              The trick encyclopedia
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
