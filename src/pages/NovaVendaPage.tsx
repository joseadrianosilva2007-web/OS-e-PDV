import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NovaVendaPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/pdv');
  }, [navigate]);
  return null;
}
