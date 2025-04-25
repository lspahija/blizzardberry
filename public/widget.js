(function() {
    const style = document.createElement('style');
    style.textContent = `
        #myWidget {
          width: 200px;
          height: 100px;
          border: 1px solid black;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          background-color: lightblue;
          cursor: pointer;
        }
      `;
    document.head.appendChild(style);

    // Update widget content and add functionality
    const widget = document.getElementById('myWidget');
    if (widget) {
        widget.innerText = 'Widget Active!';
        widget.addEventListener('click', () => {
            alert('Widget clicked!');
        });
    } else {
        console.error('Widget element not found');
    }
})();