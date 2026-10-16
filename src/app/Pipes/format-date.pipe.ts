import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "formatDate",
})
export class FormatDatePipe implements PipeTransform {
  // transform(value: Date, ...args: number[]): unknown {
  transform(value: Date | string, ...args: number[]): string {
    // TODO 1
    // En este ejercicio se pide implementar un pipe de manera que de un formato amigable a la fecha. Concretamente deberemos implementar un pipe que reciba un número como argumento, de manera que: - - - -
    // Pasamos un 1 nos devolverá el formato  25092021
    // Pasamos un 2 nos devolverá el formato  25 / 09 / 2021
    // Pasamos un 3 nos devolverá el formato  25/09/2021
    // Pasamos un 4 nos devolverá el formato  2021-09-25
    // ** Pensad que si el número del día o del mes es menor a 10 tendremos que concatenarle un cero delante nosotr@s.

    if (!value) {
      return "";
    }

    const date = new Date(value);

    // Extraer el día, mes y año
    let day = date.getDate().toString();
    // Los meses en JavaScript empiezan en 0 (Enero es 0), por eso siempre sumamos 1
    let month = (date.getMonth() + 1).toString();
    let year = date.getFullYear().toString();

    // Si el número del día o del mes es menor a 10 tendremos que concatenarle un cero delante
    if (day.length === 1) {
      day = "0" + day;
    }
    if (month.length === 1) {
      month = "0" + month;
    }

    // Recoger el número que nos pasan por argumento (1, 2, 3 o 4)
    const formatType = args[0];

    // Devolver la fecha
    switch (formatType) {
      case 1:
        return `${day}${month}${year}`;
      case 2:
        return `${day} / ${month} / ${year}`;
      case 3:
        return `${day}/${month}/${year}`;
      case 4:
        return `${year}-${month}-${day}`;
      default:
        return `${day}/${month}/${year}`;
    }

    // return null;
  }
}
