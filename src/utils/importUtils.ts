import { User, UserRole, UserStatus } from '@/types';

export interface ImportRow {
    fullName: string;
    email: string;
    phone?: string;
    idNumber: string;
    department: string;
    position: string;
    location?: string;
    startDate: string;
    contractType?: string;
    baseSalary: number;
    role?: UserRole;
    status?: UserStatus;
    managerId?: string;
}

export interface ImportResult {
    success: boolean;
    row: number;
    email: string;
    error?: string;
    user?: User;
}

/**
 * Generate CSV template for employee import
 */
export function generateEmployeeTemplate(): string {
    const headers = [
        'fullName',
        'email',
        'phone',
        'idNumber',
        'department',
        'position',
        'location',
        'startDate',
        'contractType',
        'baseSalary',
        'role',
        'status',
        'managerId'
    ];

    const sampleRow = [
        'Nguyen Van A',
        'nva@company.com',
        '0909123456',
        '079123456789',
        'Phát triển sản phẩm (Product)',
        'Senior Developer',
        'Hồ Chí Minh, VN',
        '2024-01-15',
        'Toàn thời gian (Không xác định thời hạn)',
        '25000000',
        'employee',
        'active',
        '' // managerId is optional
    ];

    return [
        headers.join(','),
        sampleRow.join(',')
    ].join('\n');
}

/**
 * Download CSV template
 */
export function downloadTemplate(): void {
    const csv = generateEmployeeTemplate();
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel compatibility
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'employee_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Parse CSV content to array of objects
 */
export function parseCSV(content: string): ImportRow[] {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
        throw new Error('CSV file is empty or contains only headers');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const rows: ImportRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row: any = {};

        headers.forEach((header, index) => {
            const value = values[index]?.trim() || '';

            // Convert to appropriate types
            if (header === 'baseSalary') {
                row[header] = value ? Number(value) : 0;
            } else if (header === 'role') {
                row[header] = (value || 'employee') as UserRole;
            } else if (header === 'status') {
                row[header] = (value || 'active') as UserStatus;
            } else if (value) {
                row[header] = value;
            }
        });

        rows.push(row as ImportRow);
    }

    return rows;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}

/**
 * Validate an import row
 */
export function validateImportRow(row: ImportRow, rowNumber: number): string | null {
    if (!row.fullName?.trim()) {
        return `Row ${rowNumber}: Full name is required`;
    }

    if (!row.email?.trim()) {
        return `Row ${rowNumber}: Email is required`;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.email)) {
        return `Row ${rowNumber}: Invalid email format`;
    }

    if (!row.idNumber?.trim()) {
        return `Row ${rowNumber}: ID Number is required`;
    }

    if (!row.department?.trim()) {
        return `Row ${rowNumber}: Department is required`;
    }

    if (!row.position?.trim()) {
        return `Row ${rowNumber}: Position is required`;
    }

    if (!row.startDate?.trim()) {
        return `Row ${rowNumber}: Start date is required`;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}[-/]\d{2}[-/]\d{2}$/;
    if (!dateRegex.test(row.startDate)) {
        return `Row ${rowNumber}: Start date must be in YYYY-MM-DD format`;
    }

    if (!row.baseSalary || row.baseSalary <= 0) {
        return `Row ${rowNumber}: Base salary must be greater than 0`;
    }

    return null;
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target?.result as string;
            resolve(content);
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
    });
}
