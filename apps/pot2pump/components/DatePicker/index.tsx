import { dayjs } from '@/lib/dayjs'
import {DatePicker as NextDatePicker, DatePickerProps as NextDatePickerProps} from '@nextui-org/react'
import { ChangeHandler } from 'react-hook-form'
interface DatePickerProps extends Omit<NextDatePickerProps, 'onChange'>{
    onChange: ChangeHandler
}

export const DatePicker = ({onChange, value, ...props}: DatePickerProps) => {
    console.log('value', value)
    return <NextDatePicker onChange={(value) => {
        // @ts-ignore
        const formValue = dayjs(value.toDate()).unix()
        console.log('formValue', formValue)
        onChange({
            type: 'number',
            target: {
                value: formValue
            }
        })
    }} {...props}></NextDatePicker>
}