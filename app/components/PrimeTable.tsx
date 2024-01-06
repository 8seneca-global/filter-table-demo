'use client';

import { FilterMatchMode, PrimeReactProvider } from 'primereact/api';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Column, ColumnFilterElementTemplateOptions } from 'primereact/column';
import { MultiSelect } from 'primereact/multiselect';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import React, { useMemo, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Employee } from '@/app/_data';

const PrimeTable = ( { data } : { data: Employee[] } ) => {
    const getDate = ( date: string ) => {
        const dateParts = date.split( '/' );
        const day = dateParts[0];
        const month = dateParts[1];
        const year = dateParts[2];
        return new Date( `${year}-${month}-${day}` );
    };

    const _data = useMemo( () => data.map( item => ( { ...item, join_at: getDate( item.join_at ) } ) ), [ data ] );

    const [ filters, setFilters ] = useState<DataTableFilterMeta>( {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        job: { value: null, matchMode: FilterMatchMode.IN },
        age: { value: null, matchMode: FilterMatchMode.EQUALS },
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

    const jobRowFilterTemplate = ( options: ColumnFilterElementTemplateOptions ) => {
        return (
            <MultiSelect
                value={options.value}
                options={_data.map( ( item: { job: string; } ) => item.job )}
                onChange={( e ) => options.filterApplyCallback( e.value )}
                placeholder="Any"
                className="p-column-filter"
                maxSelectedLabels={1}
                style={{ minWidth: '14rem' }}
            />
        );
    };

    const dateFilterTemplate = ( options: ColumnFilterElementTemplateOptions ) => {
        return <Calendar value={options.value}
            onChange={( e ) =>  options.filterApplyCallback( e.value ) }
            dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" mask="99/99/9999" />;
    };

    const formatDate = ( value: Date ) => {
        return value.toLocaleDateString( 'en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        } );
    };

    const dateBodyTemplate = ( rowData: any ) => {
        return formatDate( rowData.join_at );
    };

    type Column = {
        field: string;
        header: string;
        filterPlaceholder: string;
        sortable: boolean;
        filter: boolean;
        hide: boolean;
        showFilterMenu?: boolean;
        filterElement?: ( options: ColumnFilterElementTemplateOptions ) => React.ReactElement;
        dataType?: string;
        body?: ( rowData: any ) => React.ReactElement;
    }
    const [ columns, setColumns ] = useState<Column[]>( [
        { field: 'name', header: 'name', filterPlaceholder: 'Search by name', sortable: true, filter: true, hide: false, },
        { field: 'age', header: 'age', filterPlaceholder: 'Search by age', sortable: true, filter: true, hide: false, },
        {
            field: 'job', header: 'job', filterPlaceholder: 'Search by job', sortable: true, filter: true, hide: false,
            showFilterMenu: false, filterElement: jobRowFilterTemplate,
        },
        { field: 'country', header: 'country', filterPlaceholder: 'Search by country', sortable: true, filter: true, hide: false, },
        {
            field: 'join_at', header: 'join_at', filterPlaceholder: 'Search by join', sortable: true, filter: true, hide: false,
            dataType: 'date', body: dateBodyTemplate, filterElement: dateFilterTemplate,
        },
    ] );

    const toggleColumns = ( column: string ) => {
        const newColumns = columns.map( item => {
            if ( item.field === column ) {
                return { ...item, hide: !item.hide };
            }
            return item;
        } );
        setColumns( newColumns );
    };

    const renderHeader = () => {
        return (
            <div className="w-full grid grid-cols-3 mb-4 gap-4">
                <div className="flex items-center col-span-2">
                    <div className="p-input-icon-left w-full">
                        <i className="pi pi-search" />
                        <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" className={'w-full'} />
                    </div>
                </div>
                <div className={'flex items-center gap-4'}>
                    {
                        columns
                            .map( item => <label key={item.field}>
                                <input type="checkbox" checked={!item.hide} onChange={() => toggleColumns( item.field )} className={'mr-1'} />
                                <span>{item.field}</span>
                            </label> )
                    }
                </div>
            </div>
        );
    };

    const header = renderHeader();

    return (
        <PrimeReactProvider>
            <DataTable value={_data}
                tableStyle={{ minWidth: '50rem' }}
                removableSort
                header={header}
                filters={filters}
                paginator rows={10} rowsPerPageOptions={[ 10, 25, 50 ]}
                filterDisplay="row" globalFilterFields={[ 'name', 'age', 'job', 'country' ]} emptyMessage="No customers found."
                resizableColumns reorderableColumns
            >
                {
                    columns
                        .filter( item => !item.hide )
                        .map( item => <Column key={item.field} {...item} /> )
                }
            </DataTable>
        </PrimeReactProvider>
    );
};

export default PrimeTable;
