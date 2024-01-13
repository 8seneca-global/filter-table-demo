import { ReactElement, useEffect, useState } from 'react';
import { ColumnFilterElementTemplateOptions } from 'primereact/column';

export interface ColumnBaseType {
    field: string,
    hide?: boolean,
    passThrough?: Object,
}

export interface ColumnType extends ColumnBaseType {
    header: string;
    filterPlaceholder: string;
    sortable: boolean;
    filter: boolean;
    hide?: boolean;
    showFilterMenu?: boolean;
    filterElement?: ( options: ColumnFilterElementTemplateOptions ) => ReactElement;
    dataType?: string;
    body?: ( rowData: any ) => ReactElement;
}

export const useColumnProfile = ( columns: ColumnBaseType[] ) => {
    const [ columnSettings, setColumnSettings ] = useState<ColumnBaseType[]>( columns );

    const loadColumnSettings = () => {
        const existedConfig = localStorage.getItem( 'columnSettings' );
        if ( existedConfig ) {
            const existedConfigParsed = JSON.parse( existedConfig );
            setColumnSettings( existedConfigParsed );
        }
    };
    const saveColumnSettings = ( columns: ColumnBaseType[] ) => {
        localStorage.setItem( 'columnSettings', JSON.stringify( columns ) );
        setColumnSettings( columns );
    };

    useEffect( () => {
        loadColumnSettings();
    }, [] );

    return { columnSettings, saveColumnSettings };
};
