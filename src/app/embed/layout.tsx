export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          html, body {
            overflow: hidden !important;
            overflow-x: hidden !important;
            overflow-y: hidden !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #__next {
            overflow: visible !important;
          }
          /* Completely hide all scrollbars in iframe */
          ::-webkit-scrollbar {
            width: 0px !important;
            height: 0px !important;
            display: none !important;
          }
          * {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
        `
      }} />
      {children}
    </>
  );
}
