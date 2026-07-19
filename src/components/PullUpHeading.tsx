import { Fragment } from "react";

export type PullUpUnit = { text: string; em?: boolean };

/* masked pull-up heading — .pu คือกรอบ clip (padding กันสระ/วรรณยุกต์ไทยโดนตัด),
   .pu__in เลื่อนขึ้นเมื่อ parent .reveal ได้คลาส .in (stagger ด้วย --i) */
export default function PullUpHeading({ lines, className }: { lines: PullUpUnit[][]; className?: string }) {
  let i = 0;
  return (
    <h2 className={className}>
      {lines.map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line.map((u, ui) => {
            const idx = i++;
            return (
              <Fragment key={ui}>
                {ui > 0 && " "}
                <span className="pu">
                  <span className="pu__in" style={{ ["--i" as string]: idx }}>
                    {u.em ? <em>{u.text}</em> : u.text}
                  </span>
                </span>
              </Fragment>
            );
          })}
        </Fragment>
      ))}
    </h2>
  );
}
