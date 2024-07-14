import React, {
  useEffect,
  useLayoutEffect,
  forwardRef,
  useRef,
  ForwardedRef,
  useCallback,
  useMemo,
} from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import {
  ColDef,
  DomLayoutType,
  FirstDataRenderedEvent,
  ModuleRegistry,
} from 'ag-grid-community'
import { MenuModule } from '@ag-grid-enterprise/menu';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([
  MenuModule,
]);

interface AgGridProps {
  columnDefs: ColDef[]
  rowData: any
  width: string
  height: string
  ref?: ForwardedRef<AgGridReact>
  parentStyle?: string
  gridOptions?: any
  status?: boolean
  filterModel?: any
  onSummaryInfoReady?: any
  domLayout?: DomLayoutType | undefined
  sideBar?: boolean
}

const AgGrid: React.FC<AgGridProps> = forwardRef((props, ref) => {
  const {
    columnDefs,
    rowData,
    filterModel,
    sideBar,
    width,
    height,
    parentStyle,
    gridOptions,
    status,
    onSummaryInfoReady,
    domLayout,
  } = props
  const gridRef = useRef<AgGridReact>(null)
  // eslint-disable-next-line
  const gridStyle = useMemo(
    () => ({
      height: height !== '' ? `${height}%` : 'auto',
      width: width !== '' ? `${width}%` : 'auto',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => {
    if (status && gridRef.current.api) {
      gridRef?.current.api.showLoadingOverlay()
    } else if (!status) {
      if (gridRef.current.api) {
        gridRef.current.api.hideOverlay()
      }
    }
  }, [status])

  useEffect(() => {
    if (gridRef?.current?.api) {
      gridRef.current.api.setFilterModel(filterModel)
    }
  }, [filterModel])

  const defaultColDef = useMemo(() => {
    return {
      resizable: true,
    }
  }, [])

  const onFirstDataRendered = useCallback((params: FirstDataRenderedEvent) => {
    if (gridRef?.current?.api?.getLastDisplayedRow() > 0) {
      gridRef.current.api.sizeColumnsToFit()
      filterChanged()
    } // eslint-disable-next-line
  }, [])

  useLayoutEffect(() => {
    window.addEventListener('resize', viewPortChanged)
    return () => {
      window.removeEventListener('resize', viewPortChanged)
    }
  }, [])

  const viewPortChanged = () => {
    if (gridRef?.current?.api?.getLastDisplayedRow() > 0) {
      gridRef.current.api.sizeColumnsToFit()
    }
  }

  function onGridReady() {
    if (gridRef?.current?.api) {
      gridRef.current.api.sizeColumnsToFit()
    }
  }

  useEffect(() => {
    window.addEventListener('error', (e) => {
      if (
        e.message ===
        'ResizeObserver loop completed with undelivered notifications.'
      ) {
        const resizeObserverErrDiv = document.getElementById(
          'webpack-dev-server-client-overlay-div',
        )
        const resizeObserverErr = document.getElementById(
          'webpack-dev-server-client-overlay',
        )
        if (resizeObserverErr) {
          resizeObserverErr.setAttribute('style', 'display: none')
        }
        if (resizeObserverErrDiv) {
          resizeObserverErrDiv.setAttribute('style', 'display: none')
        }
      }
    })
    return () => {
      window.removeEventListener('error', () => {})
    }
  }, [])

  useEffect(()=>{
    if(gridOptions && gridRef?.current?.api){
      const gridApi = gridRef.current.api;
      gridApi.addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
          const cellElement = document.querySelector(`.ag-cell[row-index="${gridApi.getFocusedCell().rowIndex}"][col-id="${gridApi.getFocusedCell().column.getColId()}"]`);
          const contextMenuEvent = new MouseEvent('contextmenu', {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: event.clientX,
              clientY: event.clientY
          });
          cellElement.dispatchEvent(contextMenuEvent);
        }});
        gridApi.addEventListener('touchend',function(){
          gridApi.removeEventListener('touchstart',()=>{});
        })
    } 
  },[gridOptions, gridRef])

  function filterChanged() {
    if (onSummaryInfoReady) {
      onSummaryInfoReady(gridRef?.current?.api)
    }
  }
  return (
    <div style={gridStyle} className={`ag-theme-alpine ${parentStyle}`}>
      <AgGridReact
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowData={rowData}
        ref={gridRef}
        gridOptions={gridOptions}
        onGridReady={onGridReady}
        onFirstDataRendered={onFirstDataRendered}
        onFilterChanged={filterChanged}
        onModelUpdated={filterChanged}
        domLayout={domLayout ? domLayout : 'normal'}
        sideBar={sideBar !== undefined ? sideBar : false}
      />
    </div>
  )
})

export default AgGrid
