import { _data, Employee } from '@/app/_data';
import { FilterMatchMode } from 'primereact/api';

type Filter = {
    field: string | Array<string>;
    value: string | null;
    matchMode: FilterMatchMode;
}

const getDate = ( date: string ) => {
    const dateParts = date.split( '/' );
    const day = dateParts[0];
    const month = dateParts[1];
    const year = dateParts[2];
    return new Date( `${year}-${month}-${day}` );
};

const handleSort = ( data: Employee[], field: string, order: Number ) => {
    return data.sort( ( a, b ) => {
        // @ts-ignore
        let aField = a[ field ];
        // @ts-ignore
        let bField = b[ field ];

        if ( field === 'join_at' ) {
            aField = new Date( getDate( aField ) ).getTime();
            bField = new Date( getDate( bField ) ).getTime();
        }

        if ( aField < bField ) {
            return order === 1 ? -1 : 1;
        }
        if ( aField > bField ) {
            return order === 1 ? 1 : -1;
        }
        return 0;
    } );
};

const handlePaginate = ( data: Employee[], page = 0, limit = 25 ) => {
    // @ts-ignore
    return data.slice( page * limit, ( page + 1 ) * limit );
};

const handleFilter = ( data: Employee[], filters: Filter[] ) => {
    return data.filter( it => {
        let match = true;
        for ( const filter of filters.filter( ft => ft.value !== null ) ) {
            const { field, value, matchMode } = filter;
            if ( !value ) {
                continue;
            }
            // @ts-ignore
            let filterValue = it[ field ];
            if ( field === 'join_at' ) {
                filterValue = getDate( filterValue );
            } else {
                filterValue = filterValue.toString();
            }
            switch ( matchMode ) {
            case 'contains':
                match = filterValue.toString().toLowerCase().includes( value.toString().toLowerCase() );
                break;
            case 'equals':
                match = filterValue === value;
                break;
            default:
                match = true;
                break;
            }
            if ( !match ) {
                break;
            }
        }
        return match;
    } );
};

export async function POST( request: Request ) {
    const res = await request.json();
    console.log( res );

    const { page, rows, sortField, sortOrder, filters: _filters } = res;

    const filters: Filter[] = Object.keys( _filters )
        .filter( it => it !== 'global' )
        .map( it => {
            return {
                ..._filters[ it ],
                field: it,
            };
        } );

    let data = [
        ..._data,
    ];
    data = handleFilter( data, filters );
    if ( sortField ) {
        data = handleSort( data, sortField, sortOrder );
    }
    data = handlePaginate( data, page, rows );

    // _data as fake db

    return Response.json( {
        total: _data.length,
        data,
    } );
}
