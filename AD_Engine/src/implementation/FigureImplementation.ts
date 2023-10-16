export class FigureImplementation {
    static loadFigureIds(): Promise<Array<number>> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([1, 2, 3, 4, 5, 8]);
            }, 15_000); // Espera 10 segundos (10000 milisegundos) antes de resolver la promesa con el array.
        });
    }
}
