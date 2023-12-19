'use client';

import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { useCallback, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { _data } from '@/app/_data';

export default function Home() {
    const gridRef = useRef();
    const containerStyle = useMemo( () => ( { width: '100%', height: '500px' } ), [] );
    const gridStyle = useMemo( () => ( { height: '100%', width: '100%' } ), [] );
    const [ rowData, setRowData ] = useState( [] );
    const [ columnDefs, setColumnDefs ] = useState( [
        { field: 'name', filter: 'agTextColumnFilter' },
        { field: 'country', filter: 'agTextColumnFilter' },
        { field: 'age', type: 'numberColumn' },
        { field: 'job', filter: 'agSetColumnFilter' },
        { field: 'join_at', type: [ 'dateColumn', 'nonEditableColumn' ] },
    ] );
    const defaultColDef = useMemo( () => {
        return {
            filter: true,
            floatingFilter: true,
            menuTabs: [],
        };
    }, [] );
    const columnTypes = useMemo( () => {
        return {
            numberColumn: { filter: 'agNumberColumnFilter' },
            nonEditableColumn: { editable: false },
            dateColumn: {
                filter: 'agDateColumnFilter',
                filterParams: {
                    comparator: ( filterLocalDateAtMidnight, cellValue ) => {
                        const dateParts = cellValue.split( '/' );
                        const day = Number( dateParts[0] );
                        const month = Number( dateParts[1] ) - 1;
                        const year = Number( dateParts[2] );
                        const cellDate = new Date( year, month, day );
                        if ( cellDate < filterLocalDateAtMidnight ) {
                            return -1;
                        } else if ( cellDate > filterLocalDateAtMidnight ) {
                            return 1;
                        } else {
                            return 0;
                        }
                    },
                },
            },
        };
    }, [] );

    const onGridReady = useCallback( ( ) => {
        setRowData( _data );
    }, [ _data ] );

    const toggleColumns = useCallback( ( column: string ) => {
        const newColumnDefs = columnDefs.map( item => {
            if ( item.field === column ) {
                item.hide = !item.hide;
            }
            return item;
        } );
        setColumnDefs( newColumnDefs );
        gridRef.current?.api.setGridOption( 'columnDefs', newColumnDefs );
        gridRef.current?.api.sizeColumnsToFit();
    }, [ columnDefs ] );

    const quickSearch = useCallback( ( value: string ) => {
        gridRef.current?.api.setQuickFilter( value );
    }, [] );

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="w-full grid grid-cols-3 mb-4 gap-4">
                <div className="flex items-center col-span-2">
                    <input type="text" placeholder={'Quick search'} className={'border rounded px-4 py-2 w-full'} onChange={( e ) => quickSearch( e.target.value )} />
                </div>
                <div className={'flex items-center gap-4'}>
                    {
                        gridRef.current?.api.getGridOption( 'columnDefs' )
                            .map( item => <label key={item.field}>
                                <input type="checkbox" checked={!item.hide} onChange={() => toggleColumns( item.field )} className={'mr-1'} />
                                <span>{item.field}</span>
                            </label> )
                    }
                </div>
            </div>
            <div style={containerStyle}>
                <div style={{ height: '100%', boxSizing: 'border-box' }}>
                    <div
                        style={gridStyle}
                        className={
                            'ag-theme-quartz'
                        }
                    >
                        <AgGridReact
                            ref={gridRef}
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            columnTypes={columnTypes}
                            maintainColumnOrder={true}
                            onGridReady={onGridReady}
                            pagination={true}
                            onFirstDataRendered={( params ) => params.api.sizeColumnsToFit()}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
