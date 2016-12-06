var tableGenerator = function (idWrapperElement, options, dataTable) {
    var TABLE_TAG = "table";
    var TBODY_TAG = "tbody";
    var TR_TAG = "tr";
    var TH_TAG = "th";
    var TD_TAG = "td";
    var BUTTON_TAG = "button";
    var I_TAG = "i";
    var INPUT_TEXT = "input";
    var columnIdentifiers = [];
    var estadoCama = "";
    var prestadoraInSession = false;
    if (typeof idWrapperElement !== "string") {
        throw new Error("Parametro no válido");
    }
    var data = dataTable || null;
    var unidades = options.unidades || null;

    var elements = {
        wrapper: document.getElementById(idWrapperElement),
        table: document.createElement(TABLE_TAG),
        tbody: document.createElement(TBODY_TAG),
        titlesRow: document.createElement(TR_TAG),
        cornerCell: document.createElement(TH_TAG)
    };

    function loadStyle() {
        elements.wrapper.classList.add("wrapper-table");
        elements.table.classList.add("table", "table-striped", "table-bordered");
        elements.cornerCell.innerHTML = "&nbsp;";
        elements.cornerCell.style.width = "100px";

        elements.cornerCell.style.borderTop = "1px solid #ddd";
    }

    function createHeaderColumn(id, columnTitle) {
        var column = document.createElement(TD_TAG);
        column.id = id || "";
        column.style.borderTop = "1px solid #ddd";
        column.classList.add("header-column");
        column.appendChild(document.createTextNode(columnTitle));
        elements.titlesRow.appendChild(column);
    }

    function createHeaderRow(rowTitle, row, departamento, municipio) {
        var rowHeader = document.createElement(TH_TAG);
        rowHeader.appendChild(document.createTextNode(rowTitle));
        rowHeader.classList.add("header-row");
        rowHeader.addEventListener("click", function () {
            if (options.onRow) {
                options.onRow(rowTitle);
            }
        });

        if (departamento && municipio) {
            rowHeader.setAttribute('data-departamento', departamento);
            rowHeader.setAttribute('data-municipio', municipio);
        }
        row.appendChild(rowHeader);
    }

    function validateInputTable(idPrestador) {
        var output = true;

        var row = document.getElementById("row_" + idPrestador);
        for (var i = 2; i < row.childNodes.length; i++) {
            var cell = row.childNodes[i];
            var inputElement = cell.firstChild;
            var cantidad = inputElement.value;
            if (!cantidad || !cantidad.match(/^[0-9]{1,4}$/)) {
                output = false;
                inputElement.style.borderColor = "#d00";
            }else{
                 inputElement.style.borderColor = "#ccc";
            }
        }
        return output;
    }

    function createHeaderButtonRow(row, target) {
        var headerCell = document.createElement(TD_TAG);
        var buttonSave = document.createElement(BUTTON_TAG);
        var buttonDelete = document.createElement(BUTTON_TAG);
        buttonSave.classList.add("btn", "btn-xs", "btn-color");
        buttonDelete.classList.add("btn", "btn-xs", "btn-color");
        buttonSave.style.margin = "5px";
        buttonDelete.style.margin = "5px";
        buttonSave.title = options.saveButtonTitleRow ? options.saveButtonTitleRow : "Guardar";
        buttonDelete.title = options.deleteButtonTitleRow ? options.deleteButtonTitleRow : "Eliminar";
        var iButtonSave = document.createElement(I_TAG);
        iButtonSave.classList.add("fa", "fa-save");
        buttonSave.appendChild(iButtonSave);
        var iButtonDelete = document.createElement(I_TAG);
        iButtonDelete.classList.add("fa", "fa-trash");
        buttonDelete.appendChild(iButtonDelete);

        buttonSave.addEventListener("click", function () {
            var containerCell = this.parentNode;
            var result = {};
            if (containerCell !== null) {
                var row = containerCell.parentNode;
                var unidades = [];
                var cantidades = [];
                var rowHeader = row.childNodes[1];
                var idDepartamento = rowHeader.getAttribute("data-departamento");
                var idMunicipio = rowHeader.getAttribute("data-municipio");
                result.idDepartamento = idDepartamento;
                result.idMunicipio = idMunicipio;
                console.log("dpto " + idDepartamento + " mun " + idMunicipio);
                for (var i = 2; i < row.childNodes.length; i++) {
                    var cell = row.childNodes[i];
                    var inputElement = cell.firstChild;
                    var idArrayCell = cell.id.split("|");
                    var idunidad = idArrayCell[0];
                    var cantidad = inputElement.value;

                    if (i === 2) {
                        result.idPrestador = idArrayCell[1];
                    }

                    unidades.push(idunidad);
                    cantidades.push(cantidad);

                }
                result.unidades = unidades;
                result.cantidades = cantidades;
            }

            if (options.onSaveRow) {
                options.onSaveRow(result);
            }
        });
        buttonDelete.addEventListener("click", function () {
            var containerCell = this.parentNode;
            if (containerCell !== null) {
                var rowToDelete = containerCell.parentNode;

                while (rowToDelete.hasChildNodes()) {
                    rowToDelete.removeChild(rowToDelete.firstChild);
                }
                elements.tbody.removeChild(rowToDelete);
                if (options.onDeleteRow) {
                    var idArray = rowToDelete.id.split("_");
                    options.onDeleteRow(idArray[1]);
                }
            }
        });

        if (target === 'CREATE') {
            headerCell.appendChild(buttonSave);
            headerCell.appendChild(buttonDelete);
        } else if (target === 'DELETE') {
            buttonSave = null;
            headerCell.appendChild(buttonDelete);
        }
        elements.cornerCell.colSpan = "2";
        headerCell.style.textAlign = "center";
        headerCell.classList.add("header-row");
        row.appendChild(headerCell);
    }

    function createCell(content, row, idUnidad, idPrestador, filaName, tipoUnidad, nombrePrestador, nombreUnidad) {
        var cell = document.createElement(TD_TAG);
        cell.appendChild(document.createTextNode(content));
        cell.style.cursor = "pointer";
        cell.style.fontSize = "13px";
//        cell.style.fontWeight = "bold";
        cell.style.textAlign = "center";
        var id = "";
        if (!filaName) {
            id = (idUnidad ? idUnidad : "") + "|" + (idPrestador ? +idPrestador : "");
        } else if (idPrestador === null) {
            id = (idUnidad ? idUnidad : "") + "|" + filaName;
        }
        cell.id = id;
        cell.addEventListener("click", function () {
            if (options.onCell) {
                options.onCell(id, filaName, tipoUnidad, nombrePrestador, nombreUnidad);
            }
        });


        row.appendChild(cell);
    }

    function createInputCell(idUnidad, idPrestador, row) {
        var cell = document.createElement(TD_TAG);
        var inputText = document.createElement(INPUT_TEXT);
        inputText.type = "text";
        inputText.style.width = "50px";
        var id = "";
        if (idUnidad && idPrestador) {
            id = idUnidad + "|" + idPrestador;
        } else {
            throw new Error("El id de la unidad y de la IPS son obligatorios");
        }
        inputText.id = "input_" + id;
        cell.style.textAlign = "center";
        cell.appendChild(inputText);

        cell.id = id;
//        cell.addEventListener("click", function () {
//            if (options.onCell) {
//                options.onCell();
//            }
//        });
        row.appendChild(cell);
    }

    function loadHeadersColumns() {
        if (unidades) {
            columnIdentifiers = [];
            var units = unidades;
            units.forEach(function (unidad) {
                id = unidad.id;
                columnIdentifiers.push(id);
                var title = unidad.nombre;
                createHeaderColumn(id, title);
            });
        }
    }


    function getDataRowForObject(fila, inputData) {
        var outputObject = {};

        if (fila) {
            var units = [];
            var unidades = inputData;
            var unidadesArray = [];

            for (var property in unidades) {
                var unidad = unidades[property];
                unidadesArray.push(unidad);
            }

            unidadesArray.sort(function (unidad1, unidad2) {
                return unidad1.idUnidad - unidad2.idUnidad;
            });

            switch (fila.toLowerCase()) {
                case "total":
                    outputObject.rowName = "Total";
                    unidadesArray.forEach(function (unidad) {
                        var cantidad = unidad.cantidadOcupada + unidad.cantidadDisponible;
                        units.push({idUnidad: unidad.idUnidad, tipoUnidad: unidad.tipoUnidad, cantidad: cantidad});
                    });
                    break;
                case "disponibles":
                    outputObject.rowName = "Disponibles";
                    unidadesArray.forEach(function (unidad) {
                        units.push({idUnidad: unidad.idUnidad, tipoUnidad: unidad.tipoUnidad, cantidad: unidad.cantidadDisponible});
                    });
                    break;
                case "ocupadas":
                    outputObject.rowName = "Ocupadas";
                    unidadesArray.forEach(function (unidad) {
                        units.push({idUnidad: unidad.idUnidad, tipoUnidad: unidad.tipoUnidad, cantidad: unidad.cantidadOcupada});
                    });
                    break;
            }
            outputObject.units = units;
        }

        return outputObject;
    }

    function createStructureFromObject(input) {
        var outputObject = [];
        if (input) {
            outputObject.push(getDataRowForObject("total", input));
            outputObject.push(getDataRowForObject("disponibles", input));
            outputObject.push(getDataRowForObject("ocupadas", input));
        }

        return outputObject;
    }

    function createStructureFromArray(estado, inputData) {
        var outputObject = [];

        if (estado && inputData) {
            var prestadoras = inputData;

            prestadoras.forEach(function (prestadora) {
                var unidadesArray = [];
                var units = [];
                var ipsObject = {};

                ipsObject.idPrestador = prestadora.idPrestador;
                ipsObject.rowName = prestadora.nombrePrestador;
                var unidades = prestadora.unidades;

                for (var property in unidades) {
                    var unidad = unidades[property];
                    unidadesArray.push(unidad);
                }

                unidadesArray.sort(function (unidad1, unidad2) {
                    return unidad1.idUnidad - unidad2.idUnidad;
                });

                switch (estado.toLowerCase()) {
                    case "total":
                        unidadesArray.forEach(function (unidad) {
                            var cantidad = unidad.cantidadOcupada + unidad.cantidadDisponible;
                            units.push({idUnidad: unidad.idUnidad, tipoUnidad: unidad.tipoUnidad, cantidad: cantidad});
                        });
                        break;
                    case "disponible":

                        unidadesArray.forEach(function (unidad) {
                            units.push({idUnidad: unidad.idUnidad, tipoUnidad: unidad.tipoUnidad, cantidad: unidad.cantidadDisponible});
                        });
                        break;
                    case "ocupada":
                        unidadesArray.forEach(function (unidad) {
                            units.push({idUnidad: unidad.idUnidad, tipoUnidad: unidad.tipoUnidad, cantidad: unidad.cantidadOcupada});
                        });
                        break;
                    case "single":
                        unidadesArray.forEach(function (unidad) {
                            units.push({idUnidad: unidad.idUnidad, cantidad: unidad.cantidad});
                        });
                        break;
                }
                ipsObject.units = units;
                outputObject.push(ipsObject);

            });


        }

        return outputObject;
    }

    function createRow(mode, inputData, idDepartamento, idMunicipio) {
        if (mode === "CREATE") {
            if (inputData && utilidades.isObject(inputData) && inputData.idPrestador) {
                var prestadora = inputData;
                var row = document.createElement(TR_TAG);
                row.id = "row_" + prestadora.idPrestador;

                createHeaderButtonRow(row, "CREATE");
                createHeaderRow(prestadora.nombrePrestador, row, idDepartamento, idMunicipio);

                columnIdentifiers.forEach(function (idRegistered) {
                    createInputCell(idRegistered, prestadora.idPrestador, row);
                });

                elements.tbody.appendChild(row);

            } else {
                throw new Error("La información para crear la fila no es válida");
            }

        } else if (mode === "UPDATE") {
            if (inputData && utilidades.isObject(inputData) && inputData.idPrestador) {
                var prestadora = inputData;
                var row = document.createElement(TR_TAG);
                var unidades = prestadora.unidades;
                var unidadesArray = [];
                row.id = "row_" + prestadora.idPrestador;

                if (!prestadoraInSession) {
                    createHeaderButtonRow(row, "DELETE");
                }
                createHeaderRow(prestadora.nombrePrestador, row, prestadora.idDepartamento, prestadora.idMunicipio);

                for (var property in unidades) {
                    var unidad = unidades[property];
                    unidadesArray.push(unidad);
                }

                unidadesArray.sort(function (unidad1, unidad2) {
                    return unidad1.idUnidad - unidad2.idUnidad;
                });

                columnIdentifiers.forEach(function (idRegistered) {

                    var contentUnit = "0";
                    var nombreUnidad = "";
                    unidadesArray.forEach(function (unidad) {
                        if (unidad.idUnidad === idRegistered) {
                            contentUnit = unidad.cantidad;
                            nombreUnidad = unidad.nombreUnidad;
                        }
                    });
                    createCell(contentUnit, row, idRegistered, prestadora.idPrestador, null, null, prestadora.nombrePrestador, nombreUnidad);
                });

                elements.tbody.appendChild(row);

            } else {
                throw new Error("La información para crear la fila no es válida");
            }
        }

        elements.cornerCell.innerHTML = "";

    }

    function deleteRow(idPrestador) {
        if (idPrestador) {
            var rowToDelete = document.getElementById("row_" + idPrestador);

            while (rowToDelete.hasChildNodes()) {
                rowToDelete.removeChild(rowToDelete.firstChild);
            }
            elements.tbody.removeChild(rowToDelete);
            if (options.onDeleteRow) {
                var idArray = rowToDelete.id.split("_");
                options.onDeleteRow(idArray[1]);
            }
        }

    }
    function loadData() {
        console.log("....." + Object.prototype.toString.call(data));

        if (data && Object.prototype.toString.call(data) === '[object Array]') {
            var newData;
            var rowColor = "";
            switch (estadoCama.toLowerCase()) {
                case "total":
                    newData = createStructureFromArray("total", data);
                    rowColor = "#000";
                    break;
                case "ocupada":
                    newData = createStructureFromArray("ocupada", data);
                    rowColor = "#A00";
                    break;
                case "disponible":
                    newData = createStructureFromArray("disponible", data);
                    rowColor = "#0A0";
                    break;
                default:
                    newData = createStructureFromArray("total", data);
                    rowColor = "#000";
                    break;
            }

            newData.forEach(function (objRow) {
                var row = document.createElement(TR_TAG);
                row.style.color = rowColor;
                createHeaderRow(objRow.rowName, row);

                columnIdentifiers.forEach(function (idRegistered) {
                    var contentUnit = "0";
                    var tipoUnidad = "";
                    objRow.units.forEach(function (unidad) {
                        if (unidad.idUnidad === idRegistered) {
                            contentUnit = unidad.cantidad;
                            tipoUnidad = unidad.tipoUnidad;
                        }
                    });


                    createCell(contentUnit, row, idRegistered, objRow.idPrestador, null, tipoUnidad);
                });

                elements.tbody.appendChild(row);
            });

            elements.cornerCell.innerHTML = "Prestadora de servicios";


        } else if (data && Object.prototype.toString.call(data) === '[object Object]') {

            var newData = createStructureFromObject(data);


            newData.forEach(function (objRow) {
                var row = document.createElement(TR_TAG);
                var rowColor = "";
                switch (objRow.rowName.toLowerCase()) {
                    case "total":
                        rowColor = "#000";
                        break;
                    case "ocupadas":
                        rowColor = "#A00";
                        break;
                    case "disponibles":
                        rowColor = "#0A0";
                        break;
                    default:
                        rowColor = "#000";
                        break;
                }

                row.style.color = rowColor;
                createHeaderRow(objRow.rowName, row);

                columnIdentifiers.forEach(function (idRegistered) {
                    var contentUnit = "0";
                    var tipoUnidad = "";
                    objRow.units.forEach(function (unidad) {
                        if (unidad.idUnidad === idRegistered) {
                            contentUnit = unidad.cantidad;
                            tipoUnidad = unidad.tipoUnidad;
                        }
                    });
                    createCell(contentUnit, row, idRegistered, null, objRow.rowName, tipoUnidad);
                });


                elements.tbody.appendChild(row);
            });
        }
    }

    function destroy() {
        while (elements.tbody.hasChildNodes()) {
            var childNode = elements.tbody.firstChild;
            while (childNode.hasChildNodes()) {
                childNode.removeChild(childNode.firstChild);
            }
            elements.tbody.removeChild(childNode);
        }


        elements.table.removeChild(elements.tbody);
        elements.tbody = document.createElement(TBODY_TAG);
        elements.titlesRow = document.createElement(TR_TAG);
        elements.cornerCell = document.createElement(TH_TAG);
        elements.wrapper.removeChild(elements.table);
        elements.table = document.createElement(TABLE_TAG);
        elements.wrapper.removeAttribute("class");
    }

    function normalizeTable() {
        var filas = elements.tbody.childNodes;

        var titlesRowChildren = filas[0].childNodes;
        var cornerCell = titlesRowChildren[0];
//        repeatValidation : {
//            if (cornerCell && titlesRowChildren.length > 0) {
                var cornerCellHeight = cornerCell.offsetHeight;
                    var secondChildHeight = (titlesRowChildren[1]).offsetHeight;

                    if (secondChildHeight > cornerCellHeight) {
                        cornerCell.style.height = secondChildHeight + "px";
                    } else if (secondChildHeight < cornerCellHeight) {
                        for (var i = 1; i < titlesRowChildren.length; i++) {
                            var cell = titlesRowChildren[i];
                            cell.height = cornerCellHeight;
                        }
                    }
                    for (var i = 1; i < filas.length; i++) {
                        var row = filas[i];
                        var celdas = row.childNodes;
                        var firstHeight = celdas[0].offsetHeight;
                        console.log("....." + firstHeight);

                        for (var j = 1; j < celdas.length; j++) {
                            var cell = celdas[j];
                            if (cell.offsetHeight !== firstHeight) {
                                cell.height = firstHeight;
                            }
                        }
                    }
//            } else {
//                break repeatValidation;
//            }
//        }

    }
    function initialize() {
        if (elements.table.parentNode === elements.wrapper) {
            destroy();
        }
        elements.titlesRow.appendChild(elements.cornerCell);
        elements.tbody.appendChild(elements.titlesRow);
        loadStyle();
        loadHeadersColumns();
        loadData();
        elements.table.appendChild(elements.tbody);
        elements.wrapper.appendChild(elements.table);

//        document.querySelectorAll("th.fixed-column");
        normalizeTable();
    }

    function setData(dataJSON) {
        data = dataJSON;
        initialize();
    }

    function setUnidades(units) {
        unidades = units;
    }

    function setEstadoCama(estado) {
        estadoCama = estado;
    }



    function getEstadoCama() {
        return  estadoCama;
    }

    function isVisible() {
        return  elements.table.parentNode === elements.wrapper;
    }

    function setPrestadoraInSession(parameter) {
        prestadoraInSession = parameter;
    }

    if (data !== null) {
        initialize();
    }



    return {
        setData: setData,
        validateInputTable: validateInputTable,
        setUnidades: setUnidades,
        setEstadoCama: setEstadoCama,
        getEstadoCama: getEstadoCama,
        initialize: initialize,
        destroy: destroy,
        isVisible: isVisible,
        createRow: createRow,
        setPrestadoraInSession: setPrestadoraInSession,
        deleteRow: deleteRow
    };
};



