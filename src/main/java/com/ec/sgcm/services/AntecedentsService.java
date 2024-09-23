package com.ec.sgcm.services;

import java.util.List;
import com.ec.sgcm.model.Antecedents;

public interface AntecedentsService {

    Antecedents createNewAntecedent(Antecedents antecedents);

    Antecedents updateAntecedent(Antecedents antecedents);

    List<Antecedents> getAllAntecedents();

    Antecedents getAntecedentById(Long id);

    void deleteAntecedent(Long id);
}
