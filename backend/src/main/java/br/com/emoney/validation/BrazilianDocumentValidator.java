package br.com.emoney.validation;

public final class BrazilianDocumentValidator {
    private BrazilianDocumentValidator() {
    }

    public static boolean isValidCpf(String value) {
        String digits = onlyDigits(value);
        if (digits.length() != 11 || digits.chars().distinct().count() == 1) {
            return false;
        }

        int sum = 0;
        for (int i = 0; i < 9; i++) {
            sum += Character.getNumericValue(digits.charAt(i)) * (10 - i);
        }
        int first = (sum * 10) % 11;
        if (first == 10) {
            first = 0;
        }
        if (first != Character.getNumericValue(digits.charAt(9))) {
            return false;
        }

        sum = 0;
        for (int i = 0; i < 10; i++) {
            sum += Character.getNumericValue(digits.charAt(i)) * (11 - i);
        }
        int second = (sum * 10) % 11;
        if (second == 10) {
            second = 0;
        }
        return second == Character.getNumericValue(digits.charAt(10));
    }

    public static boolean isValidCnpj(String value) {
        String digits = onlyDigits(value);
        if (digits.length() != 14 || digits.chars().distinct().count() == 1) {
            return false;
        }

        int[] weights1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int[] weights2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

        int sum = 0;
        for (int i = 0; i < 12; i++) {
            sum += Character.getNumericValue(digits.charAt(i)) * weights1[i];
        }
        int first = sum % 11;
        first = first < 2 ? 0 : 11 - first;
        if (first != Character.getNumericValue(digits.charAt(12))) {
            return false;
        }

        sum = 0;
        for (int i = 0; i < 13; i++) {
            sum += Character.getNumericValue(digits.charAt(i)) * weights2[i];
        }
        int second = sum % 11;
        second = second < 2 ? 0 : 11 - second;
        return second == Character.getNumericValue(digits.charAt(13));
    }

    public static String onlyDigits(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }
}
