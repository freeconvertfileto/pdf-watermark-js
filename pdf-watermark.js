(function () {
    'use strict';

    var uploadArea = document.getElementById('pwmUploadArea');
    var uploadBtn = document.getElementById('pwmUploadBtn');
    var fileInput = document.getElementById('pwmFileInput');
    var editor = document.getElementById('pwmEditor');
    var fileNameEl = document.getElementById('pwmFileName');
    var watermarkTextInput = document.getElementById('pwmText');
    var fontSizeSelect = document.getElementById('pwmFontSize');
    var colorInput = document.getElementById('pwmColor');
    var opacitySlider = document.getElementById('pwmOpacity');
    var opacityValueEl = document.getElementById('pwmOpacityValue');
    var positionSelect = document.getElementById('pwmPosition');
    var addBtn = document.getElementById('pwmAddBtn');
    var statusEl = document.getElementById('pwmStatus');
    var outputPanel = document.getElementById('pwmOutput');
    var pagesContainer = document.getElementById('pwmPages');

    var currentFile = null;

    if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        var k = 1024;
        var sizes = ['Bytes', 'KB', 'MB', 'GB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    function hexToRgba(hex, alpha) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

    function drawWatermark(ctx, canvasWidth, canvasHeight, text, fontSize, color, opacity, position) {
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.font = 'bold ' + fontSize + 'px Arial, sans-serif';
        ctx.textBaseline = 'middle';

        var metrics = ctx.measureText(text);
        var textWidth = metrics.width;
        var textHeight = fontSize;
        var padding = 20;
        var x, y;

        if (position === 'center') {
            x = canvasWidth / 2;
            y = canvasHeight / 2;
            ctx.textAlign = 'center';
            ctx.translate(x, y);
            ctx.rotate(-Math.PI / 6);
            ctx.fillText(text, 0, 0);
        } else if (position === 'top-left') {
            x = padding + textWidth / 2;
            y = padding + textHeight / 2;
            ctx.textAlign = 'center';
            ctx.translate(x, y);
            ctx.fillText(text, 0, 0);
        } else if (position === 'top-right') {
            x = canvasWidth - padding - textWidth / 2;
            y = padding + textHeight / 2;
            ctx.textAlign = 'center';
            ctx.translate(x, y);
            ctx.fillText(text, 0, 0);
        } else if (position === 'bottom-left') {
            x = padding + textWidth / 2;
            y = canvasHeight - padding - textHeight / 2;
            ctx.textAlign = 'center';
            ctx.translate(x, y);
            ctx.fillText(text, 0, 0);
        } else if (position === 'bottom-right') {
            x = canvasWidth - padding - textWidth / 2;
            y = canvasHeight - padding - textHeight / 2;
            ctx.textAlign = 'center';
            ctx.translate(x, y);
            ctx.fillText(text, 0, 0);
        }
        ctx.restore();
    }

    function handleFile(file) {
        if (!file || file.type !== 'application/pdf') {
            alert('Please select a valid PDF file.');
            return;
        }
        currentFile = file;
        fileNameEl.textContent = file.name + ' (' + formatFileSize(file.size) + ')';
        editor.style.display = 'block';
        outputPanel.style.display = 'none';
        pagesContainer.innerHTML = '';
        statusEl.textContent = '';
    }

    uploadArea.addEventListener('click', function (e) {
        if (e.target.closest('#pwmEditor')) return;
        fileInput.click();
    });

    uploadBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        fileInput.click();
    });

    fileInput.addEventListener('change', function (e) {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
            fileInput.value = '';
        }
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function (eventName) {
        uploadArea.addEventListener(eventName, function (e) {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    ['dragenter', 'dragover'].forEach(function (eventName) {
        uploadArea.addEventListener(eventName, function () {
            uploadArea.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(function (eventName) {
        uploadArea.addEventListener(eventName, function () {
            uploadArea.classList.remove('drag-over');
        });
    });

    uploadArea.addEventListener('drop', function (e) {
        var files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    opacitySlider.addEventListener('input', function () {
        opacityValueEl.textContent = opacitySlider.value;
    });

    addBtn.addEventListener('click', function () {
        if (!currentFile) return;
        addWatermark();
    });

    function addWatermark() {
        var wmText = watermarkTextInput.value.trim();
        if (!wmText) {
            statusEl.textContent = 'Please enter watermark text.';
            return;
        }

        var fontSize = parseInt(fontSizeSelect.value, 10);
        var color = colorInput.value;
        var opacity = parseInt(opacitySlider.value, 10) / 100;
        var position = positionSelect.value;

        addBtn.disabled = true;
        statusEl.textContent = 'Loading PDF...';
        outputPanel.style.display = 'none';
        pagesContainer.innerHTML = '';

        var reader = new FileReader();
        reader.onload = function (e) {
            var typedArray = new Uint8Array(e.target.result);
            window.pdfjsLib.getDocument({ data: typedArray }).promise.then(function (pdfDoc) {
                var numPages = pdfDoc.numPages;
                statusEl.textContent = 'Processing ' + numPages + ' page(s)...';
                outputPanel.style.display = 'block';

                var pageIndex = 0;
                function renderNext() {
                    if (pageIndex >= numPages) {
                        statusEl.textContent = 'Done. ' + numPages + ' page(s) watermarked.';
                        addBtn.disabled = false;
                        return;
                    }
                    var currentPageNum = pageIndex + 1;
                    statusEl.textContent = 'Processing page ' + currentPageNum + ' of ' + numPages + '...';
                    pdfDoc.getPage(currentPageNum).then(function (page) {
                        var scale = 2.0;
                        var viewport = page.getViewport({ scale: scale });
                        var canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        var ctx = canvas.getContext('2d');
                        var renderContext = { canvasContext: ctx, viewport: viewport };
                        page.render(renderContext).promise.then(function () {
                            drawWatermark(ctx, canvas.width, canvas.height, wmText, fontSize * scale, color, opacity, position);

                            var dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                            var card = document.createElement('div');
                            card.className = 'pwm-page-card';

                            var img = document.createElement('img');
                            img.className = 'pwm-page-img';
                            img.src = dataUrl;
                            img.alt = 'Page ' + currentPageNum;

                            var label = document.createElement('span');
                            label.className = 'pwm-page-label';
                            label.textContent = 'Page ' + currentPageNum;

                            var baseName = currentFile.name.replace(/\.pdf$/i, '');
                            var link = document.createElement('a');
                            link.className = 'pwm-page-download';
                            link.href = dataUrl;
                            link.download = baseName + '-watermarked-page-' + currentPageNum + '.jpg';
                            link.textContent = 'Download JPG';

                            card.appendChild(img);
                            card.appendChild(label);
                            card.appendChild(link);
                            pagesContainer.appendChild(card);

                            pageIndex++;
                            renderNext();
                        });
                    });
                }
                renderNext();
            }).catch(function (err) {
                statusEl.textContent = 'Error: ' + err.message;
                addBtn.disabled = false;
            });
        };
        reader.onerror = function () {
            statusEl.textContent = 'Error reading file.';
            addBtn.disabled = false;
        };
        reader.readAsArrayBuffer(currentFile);
    }

})();
