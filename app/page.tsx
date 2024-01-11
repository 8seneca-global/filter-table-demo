import { _data } from '@/app/_data';
import AgGrid from '@/app/components/AgGrid';
import PrimeTable from '@/app/components/PrimeTable';

export default function Home() {
    return <main className="flex min-h-screen flex-col p-24 gap-10">
        {/*<div>*/}
        {/*    <h3 className={'text-3xl mb-6'}>AgGrid</h3>*/}
        {/*    <AgGrid data={_data}/>*/}
        {/*</div>*/}
        <div>
            <h3 className={'text-3xl mb-6'}>PrimeTable</h3>
            <PrimeTable data={_data} />
        </div>
    </main>;
}
