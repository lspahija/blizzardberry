import { NextResponse } from "next/server";

export async function GET() {
    const widgetCode = `
    (function() {
      const widget = document.getElementById('myWidget');
      if (widget) {
        widget.style.backgroundColor = 'lightblue';
        widget.innerText = 'Widget Active!';
        widget.addEventListener('click', () => {
          alert('Widget clicked!');
        });
      } else {
        console.error('Widget element not found');
      }
    })();
  `;

    return new NextResponse(widgetCode, {
        headers: {
            "Content-Type": "application/javascript",
        },
    });
}