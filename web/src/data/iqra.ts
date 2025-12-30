export interface IqraPage {
    id: string;
    pageNumber: number;
    title: string;
    content: string;
}

export const IQRA_1_DATA: IqraPage[] = [
    {
        id: 'iqra-1-page-1',
        pageNumber: 1,
        title: 'Page 1 (Ba-A-Ba)',
        content: "ا ب ا ب ا ب ب ا ب ا ب ا"
    },
    {
        id: 'iqra-1-page-2',
        pageNumber: 2,
        title: 'Page 2 (Ta-Ba-A)',
        content: "ت ب ا ت ا ب ا ب ت ب ت ا"
    },
    {
        id: 'iqra-1-page-3',
        pageNumber: 3,
        title: 'Page 3 (Tha-Ta-Ba)',
        content: "ث ت ب ث ب ت ت ث ب ب ت ث"
    }
];
