export interface SearchFormProps {
  heroName: string,
  date: string,
  strongLevel: 'T0' | 'T2' | 'T3' | 'T4' | '',
  position: '1' | '2' | '3' | '4' | '5' | ''
}
export interface HeroFormProps extends SearchFormProps {
  poster: any[],
}
export interface TableRecordProps extends HeroFormProps {}
