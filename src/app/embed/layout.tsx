export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="embed-root">
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Hide scrollbars on html/body only */
          html, body {
            overflow: hidden !important;
            overflow-x: hidden !important;
            overflow-y: hidden !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          html::-webkit-scrollbar,
          body::-webkit-scrollbar {
            width: 0 !important;
            height: 0 !important;
            display: none !important;
          }
          #__next, #embed-root {
            overflow: visible !important;
          }

          /* ===== Skills scroll area — force scrollbar visible ===== */
          #embed-root .skills-scroll-area,
          div.skills-scroll-area,
          .skills-scroll-area {
            overflow-y: scroll !important;
            overflow-x: hidden !important;
            max-height: 256px !important;
            scrollbar-width: thin !important;
            scrollbar-color: #c4c4c4 #f1f1f1 !important;
            -ms-overflow-style: scrollbar !important;
            -webkit-overflow-scrolling: touch !important;
          }
          #embed-root .skills-scroll-area::-webkit-scrollbar,
          div.skills-scroll-area::-webkit-scrollbar,
          .skills-scroll-area::-webkit-scrollbar {
            width: 6px !important;
            height: auto !important;
            display: block !important;
            visibility: visible !important;
            -webkit-appearance: scrollbar !important;
            background: #f1f1f1 !important;
          }
          #embed-root .skills-scroll-area::-webkit-scrollbar-track,
          .skills-scroll-area::-webkit-scrollbar-track {
            background: #f1f1f1 !important;
            border-radius: 3px !important;
          }
          #embed-root .skills-scroll-area::-webkit-scrollbar-thumb,
          .skills-scroll-area::-webkit-scrollbar-thumb {
            background: #c4c4c4 !important;
            border-radius: 3px !important;
            min-height: 30px !important;
          }
          #embed-root .skills-scroll-area::-webkit-scrollbar-thumb:hover,
          .skills-scroll-area::-webkit-scrollbar-thumb:hover {
            background: #a0a0a0 !important;
          }
        `
      }} />
      {children}
    </div>
  );
}
