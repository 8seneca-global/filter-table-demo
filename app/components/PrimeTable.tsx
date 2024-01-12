'use client';

import { FilterMatchMode, PrimeReactProvider } from 'primereact/api';
import { DataTable, DataTableFilterMeta, DataTableStateEvent } from 'primereact/datatable';
import { Column, ColumnFilterElementTemplateOptions } from 'primereact/column';
import { MultiSelect } from 'primereact/multiselect';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Employee } from '@/app/_data';
import { Button } from 'primereact/button';
import { ColumnType, ColumnBaseType, useColumnProfile } from '@/app/hooks/useColumnProfile';

const PrimeTable = () => {
    const [ employees, setEmployees ] = useState<Employee[]>( [] );

    const [ filters, setFilters ] = useState<DataTableFilterMeta>( {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { value: null, matchMode: FilterMatchMode.CONTAINS },
        job: { value: null, matchMode: FilterMatchMode.IN },
        age: { value: null, matchMode: FilterMatchMode.EQUALS },
        country: { value: null, matchMode: FilterMatchMode.CONTAINS },
        join_at: { value: null, matchMode: FilterMatchMode.DATE_IS },
    } );
    const [ globalFilterValue, setGlobalFilterValue ] = useState<string>( '' );

    const onGlobalFilterChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
        const value = e.target.value;
        let _filters = { ...filters };

        // @ts-ignore
        _filters['global'].value = value;

        setFilters( _filters );
        setGlobalFilterValue( value );
    };

    const jobRowFilterTemplate = useCallback( ( options: ColumnFilterElementTemplateOptions ) => {
        return (
            <MultiSelect
                value={options.value}
                options={employees.map( ( item: { job: string; } ) => item.job )}
                onChange={( e ) => options.filterApplyCallback( e.value )}
                placeholder="Any"
                className="p-column-filter"
                maxSelectedLabels={1}
                style={{ minWidth: '14rem' }}
            />
        );
    }, [ employees ] );

    const dateFilterTemplate = ( options: ColumnFilterElementTemplateOptions ) => {
        return <Calendar value={options.value}
            onChange={( e ) =>  options.filterApplyCallback( e.value ) }
            dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" mask="99/99/9999" />;
    };

    const formatDate = ( value: Date ) : string => {
        return value.toLocaleDateString( 'en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        } );
    };

    const dateBodyTemplate = useCallback( ( rowData: any ) : React.ReactElement => {
        return <span>
            {
                formatDate( rowData.join_at )
            }
        </span>;
    }, [] );

    const { columnSettings, saveColumnSettings } = useColumnProfile( [
        { field: 'name', hide: false },
        { field: 'age', hide: false },
        { field: 'job', hide: false },
        { field: 'country', hide: false },
        { field: 'join_at', hide: false },
    ] );
    const columns = useMemo<ColumnType[]>( () => [
        { field: 'name', header: 'name', filterPlaceholder: 'Search by name', sortable: true, filter: true, },
        { field: 'age', header: 'age', filterPlaceholder: 'Search by age', sortable: true, filter: true, },
        {
            field: 'job', header: 'job', filterPlaceholder: 'Search by job', sortable: true, filter: true,
            showFilterMenu: false, filterElement: jobRowFilterTemplate,
        },
        { field: 'country', header: 'country', filterPlaceholder: 'Search by country', sortable: true, filter: true, },
        {
            field: 'join_at', header: 'join_at', filterPlaceholder: 'Search by join', sortable: true, filter: true,
            dataType: 'date', body: dateBodyTemplate, filterElement: dateFilterTemplate,
        },
    ], [ dateBodyTemplate, jobRowFilterTemplate ] );

    const toggleColumns = ( column: string ) => {
        const newColumns: ColumnBaseType[] = columnSettings.map( item => {
            if ( item.field === column ) {
                return { ...item, hide: !item.hide };
            }
            return item;
        } );
        saveColumnSettings( newColumns );
    };

    // @ts-ignore
    const onColReorder = ( e ) => {
        const newColumns: ColumnBaseType[] = e.columns.map( ( column: { props: { field: string; }; } ) => {
            const { field } = column.props;
            return columnSettings.find( ( item: { field: string; } ) => item.field === field );
        } );
        // add hidden columns
        if ( newColumns.length < columnSettings.length ) {
            const hiddenColumns = columnSettings.filter( item => item.hide );
            newColumns.push( ...hiddenColumns );
        }
        saveColumnSettings( newColumns );
    };

    const dt = useRef( null );
    const exportCSV = () => {
        // @ts-ignore
        dt.current?.exportCSV( { selectionOnly: false } );
    };

    const renderHeader = () => {
        return (
            <div className="w-full grid grid-cols-6 mb-4 gap-4">
                <div className="flex items-center col-span-3">
                    <div className="p-input-icon-left w-full">
                        <i className="pi pi-search" />
                        <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" className={'w-full'} />
                    </div>
                </div>
                <div className={'flex items-center gap-4 col-span-2'}>
                    {
                        columnSettings
                            .map( item => <label key={item.field}>
                                <input type="checkbox" checked={!item.hide} onChange={() => toggleColumns( item.field )} className={'mr-1'} />
                                <span>{item.field}</span>
                            </label> )
                    }
                </div>
                <div>
                    <Button type="button" rounded onClick={() => exportCSV()} data-pr-tooltip="CSV">
                        Download CSV
                    </Button>
                </div>
            </div>
        );
    };

    const header = renderHeader();

    const [ totalRecords, setTotalRecords ] = useState( 0 );
    const [ lazyState, setLazyState ] = useState( {
        first: 0,
        rows: 10,
        page: 0,
        sortField: '',
        sortOrder: null,
        filters,
    } );

    const onPage = ( event: DataTableStateEvent ) => {
        // @ts-ignore
        setLazyState( event );
    };

    const onSort = ( event: DataTableStateEvent ) => {
        // @ts-ignore
        setLazyState( event );
    };

    const onFilter = ( event: DataTableStateEvent ) => {
        event['first'] = 0;
        // @ts-ignore
        setLazyState( event );
    };

    const loadLazyData = async ( lazyState: DataTableStateEvent ) => {
        const getDate = ( date: string ) => {
            const dateParts = date.split( '/' );
            const day = dateParts[0];
            const month = dateParts[1];
            const year = dateParts[2];
            return new Date( `${year}-${month}-${day}` );
        };

        try {
            const res = await fetch( '/api/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify( lazyState ),
            } );
            const data = await res.json();
            setEmployees( data.data.map( ( item: Employee ) => ( { ...item, join_at: getDate( item.join_at ) } ) ) );
            setTotalRecords( data.total );
        } catch ( e ) {
            console.log( e );
        }
    };

    useEffect( () => {
        // @ts-ignore
        loadLazyData( lazyState ).then( () => {} );
    }, [ lazyState ] );

    return (
        <PrimeReactProvider>
            <DataTable value={employees}
                ref={dt}
                tableStyle={{ minWidth: '50rem' }}
                removableSort
                header={header}
                filters={filters}
                paginator rows={lazyState.rows} rowsPerPageOptions={[ 10, 25, 50 ]}
                filterDisplay="row" globalFilterFields={[ 'name', 'age', 'job', 'country' ]} emptyMessage="No employees found."
                resizableColumns reorderableColumns onColReorder={onColReorder}
                lazy first={lazyState.first} onPage={onPage} totalRecords={totalRecords}
                onSort={onSort} sortField={lazyState.sortField} sortOrder={lazyState.sortOrder}
                onFilter={onFilter}
            >
                {
                    columnSettings
                        .filter( item => !item.hide )
                        .map( item => {
                            const column = columns.find( column => column.field === item.field );
                            if ( !column ) return null;
                            return <Column key={item.field} {...column} />;
                        } )
                }
            </DataTable>
        </PrimeReactProvider>
    );
};

export default PrimeTable;
